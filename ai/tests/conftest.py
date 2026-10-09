import pytest

from app.services import skill_service


@pytest.fixture(autouse=True)
def keep_semantic_model_offline(monkeypatch):
    """Unit tests use deterministic alias matching and never download model weights."""
    monkeypatch.setattr(skill_service, "_get_model", lambda: None)
    monkeypatch.setattr(skill_service, "_embedding", lambda _skill: None)
    monkeypatch.setattr(skill_service, "_semantic_similarity", lambda _left, _right: None)
