"""Train and evaluate the placement risk models from generated CSV data."""
import csv
import json
import sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.schemas import PlacementActivity, Student
from app.services.risk_service import FEATURE_NAMES, features_for_student


def read_csv(name):
    with (ROOT / "data" / name).open(encoding="utf-8", newline="") as stream:
        return list(csv.DictReader(stream))


def main():
    students = read_csv("students.csv")
    apps = read_csv("applications.csv")
    interviews = read_csv("interviews.csv")
    offers = read_csv("offers.csv")
    app_by_student = {}
    for row in apps:
        stats = app_by_student.setdefault(row["student_id"], {"drives_applied": 0, "shortlisted": 0, "rejections": 0})
        stats["drives_applied"] += 1
        stats["shortlisted"] += row["shortlisted"].lower() == "true"
    int_by_student = {}
    for row in interviews:
        if row["attended"].lower() == "true":
            int_by_student[row["student_id"]] = int_by_student.get(row["student_id"], 0) + 1
    accepted = set()
    for row in offers:
        if row["accepted"].lower() == "true":
            accepted.add(row["student_id"])
    rows, labels = [], []
    for raw in students:
        student_data = dict(raw)
        for name in ("skills", "projects"):
            student_data[name] = json.loads(student_data[name])
        for name in ("cgpa", "backlogs", "graduation_year", "aptitude_score", "communication_score", "mock_interview_score"):
            student_data[name] = float(student_data[name]) if student_data[name] not in ("", "None") else None
        student_data["backlogs"] = int(student_data["backlogs"])
        student_data["graduation_year"] = int(student_data["graduation_year"])
        student_data["is_synthetic"] = True
        student = Student.model_validate(student_data)
        stats = app_by_student.get(student.student_id, {"drives_applied": 0, "shortlisted": 0, "rejections": 0})
        stats = dict(stats)
        # Count applications rejected at initial screening only; never derive a
        # predictor from offer rows because that would encode the target.
        stats["rejections"] = max(0, stats["drives_applied"] - stats["shortlisted"])
        activity = PlacementActivity(**stats, interviews_attended=int_by_student.get(student.student_id, 0))
        feature_values = features_for_student(student, activity)
        rows.append([feature_values[name] for name in FEATURE_NAMES])
        labels.append(int(student.student_id not in accepted))

    X = np.asarray(rows, dtype=object)
    y = np.asarray(labels)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    models = {
        "logistic_regression": make_pipeline(SimpleImputer(strategy="median"), StandardScaler(), LogisticRegression(max_iter=1200, class_weight="balanced", random_state=42)),
        "gradient_boosting": make_pipeline(SimpleImputer(strategy="median"), GradientBoostingClassifier(random_state=42, n_estimators=70, max_depth=2, learning_rate=0.05, min_samples_leaf=10)),
    }
    outcomes = {}
    for name, pipeline in models.items():
        pipeline.fit(X_train, y_train)
        prob = pipeline.predict_proba(X_test)[:, 1]
        pred = (prob >= 0.5).astype(int)
        outcomes[name] = (roc_auc_score(y_test, prob), pipeline, prob, pred)
    selected_name = max(outcomes, key=lambda key: outcomes[key][0])
    auc, selected, prob, pred = outcomes[selected_name]
    metrics = {"selected_model": selected_name, "rows": int(len(y)), "unplaced_rate": round(float(y.mean()), 4),
               "accuracy": round(float(accuracy_score(y_test, pred)), 4), "precision": round(float(precision_score(y_test, pred, zero_division=0)), 4),
               "recall": round(float(recall_score(y_test, pred, zero_division=0)), 4), "f1": round(float(f1_score(y_test, pred, zero_division=0)), 4),
               "roc_auc": round(float(auc), 4), "confusion_matrix": confusion_matrix(y_test, pred).tolist(), "test_size": int(len(y_test)),
               "note": "Evaluation uses a stratified 80/20 split with random_state=42; label 1 means no accepted offer."}
    model_dir = ROOT / "app" / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    imputer = selected.named_steps["simpleimputer"]
    X_imputed = imputer.transform(X)
    medians = {name: float(np.nanmedian(np.asarray(X[:, i], dtype=float))) for i, name in enumerate(FEATURE_NAMES)}
    scales = {name: float(max(np.nanstd(np.asarray(X[:, i], dtype=float)), 1.0)) for i, name in enumerate(FEATURE_NAMES)}
    means_unplaced = np.nanmean(X[y == 1].astype(float), axis=0)
    means_placed = np.nanmean(X[y == 0].astype(float), axis=0)
    if selected_name == "logistic_regression":
        estimator = selected.named_steps["logisticregression"]
        importances = np.abs(estimator.coef_[0])
        directions = np.sign(estimator.coef_[0])
    else:
        estimator = selected.named_steps["gradientboostingclassifier"]
        importances = estimator.feature_importances_
        directions = np.sign(means_unplaced - means_placed)
    bundle = {"pipeline": selected, "feature_names": FEATURE_NAMES,
              "feature_importances": dict(zip(FEATURE_NAMES, map(float, importances))),
              "unplaced_directions": dict(zip(FEATURE_NAMES, map(float, directions))),
              "feature_medians": medians, "feature_scales": scales}
    joblib.dump(bundle, model_dir / "risk_model.joblib")
    (model_dir / "risk_metrics.json").write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    readme = ROOT / "data" / "README.md"
    existing = readme.read_text(encoding="utf-8") if readme.exists() else "# Synthetic placement data\n"
    marker = "## Model evaluation\n"
    summary = marker + f"Selected **{selected_name}** by ROC-AUC. Stratified test metrics: accuracy {metrics['accuracy']}, precision {metrics['precision']}, recall {metrics['recall']}, F1 {metrics['f1']}, ROC-AUC {metrics['roc_auc']}. Confusion matrix (actual rows [placed, unplaced], predicted columns [placed, unplaced]): `{metrics['confusion_matrix']}`.\n\n"
    existing = existing.split(marker)[0].rstrip() + "\n\n" + summary
    readme.write_text(existing, encoding="utf-8")
    print(json.dumps(metrics, indent=2))
    too_easy = {key: value for key, value in metrics.items() if key in {"accuracy", "precision", "recall", "f1", "roc_auc"} and value > 0.97}
    if too_easy:
        print("WARNING: metrics above 0.97 require generator review:", too_easy)


if __name__ == "__main__":
    main()
