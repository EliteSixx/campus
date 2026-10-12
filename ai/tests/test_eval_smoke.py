from eval.run_eval import run_evaluation


def test_evaluation_smoke_has_expected_result_keys():
    result = run_evaluation(smoke=True, try_embeddings=False, output_path=None)

    assert {"metadata", "matching_vs_shortlisting", "generator_shortlist_signal_ceiling", "eligibility_gate_correctness", "readiness_vs_outcomes", "jd_parser_accuracy", "skill_matching", "risk_model", "latency"} <= result.keys()
    assert {"seed", "smoke_mode", "data_source", "matching_mode_for_pipeline_metrics", "circularity_note", "embedding_load_error"} <= result["metadata"].keys()
    assert {"overall", "per_job", "pair_count", "job_count", "bootstrap_confidence_intervals", "per_job_diagnostic"} <= result["matching_vs_shortlisting"].keys()
    assert {"upper_bound_under_generator_noise_roc_auc", "noisy_signal_vs_preflip_label_roc_auc_no_17_percent_flip", "matcher_auc_chance_adjusted_share_of_deterministic_signal_pct", "matcher_auc_share_of_oracle_signal_diagnostic_only_pct", "source"} <= result["generator_shortlist_signal_ceiling"].keys()
    bootstrap = result["matching_vs_shortlisting"]["bootstrap_confidence_intervals"]
    assert {"matcher", "cgpa_only", "seeded_random"} <= bootstrap["roc_auc"].keys()
    assert {"lower_95", "upper_95"} <= bootstrap["paired_difference_matcher_minus_cgpa_only"].keys()
    assert {"sample_size", "agreement_rate", "disagreements"} <= result["eligibility_gate_correctness"].keys()
    assert {"readiness_roc_auc_for_placed", "mean_readiness_placed", "mean_readiness_unplaced", "monotonicity"} <= result["readiness_vs_outcomes"].keys()
    assert {"field_accuracy", "skill_level_precision_recall_f1", "incorrect_cases"} <= result["jd_parser_accuracy"].keys()
    assert {"exact_plus_alias", "embedding_loaded", "embedding_plus_alias", "embedding_threshold", "related_threshold_sweep", "related_pair_similarities"} <= result["skill_matching"].keys()
    assert {"accuracy", "precision", "recall", "f1", "roc_auc", "confusion_matrix", "caveats"} <= result["risk_model"].keys()
    assert {"match_one_pair", "rank_100_students", "rank_500_students", "machine_description"} <= result["latency"].keys()
