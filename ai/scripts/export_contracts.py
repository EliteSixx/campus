"""Regenerate contracts/openapi.json and contracts/examples/*.json from the code.

Run from the ai/ folder:  python scripts/export_contracts.py
Commit the output. Never edit the generated files by hand.
"""
import json
import sys
from pathlib import Path

AI_DIR = Path(__file__).resolve().parents[1]
ROOT = AI_DIR.parent
sys.path.insert(0, str(AI_DIR))

from app import examples as ex  # noqa: E402
from app.main import app  # noqa: E402

out = ROOT / "contracts"
(out / "examples").mkdir(parents=True, exist_ok=True)

(out / "openapi.json").write_text(json.dumps(app.openapi(), indent=2), encoding="utf-8")
for name, body in ex.EXAMPLES.items():
    (out / "examples" / f"{name}.json").write_text(json.dumps(body, indent=2), encoding="utf-8")

print(f"Wrote openapi.json and {len(ex.EXAMPLES)} example files to {out}")
