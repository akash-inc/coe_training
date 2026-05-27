import pytest
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.repositories import (
    PreferenceConflictError,
    PreferenceStorageError,
    SqlAlchemyUserPreferenceRepository,
)


def _build_repo_with_query_first_result(mocker, first_result):
    mock_session = mocker.Mock()
    query = mock_session.query.return_value
    filtered = query.filter.return_value
    filtered.first.return_value = first_result
    return SqlAlchemyUserPreferenceRepository(mock_session), mock_session


def test_upsert_creates_new_preference(mocker):
    repo, session = _build_repo_with_query_first_result(mocker, first_result=None)

    def fake_refresh(model):
        model.id = 1

    session.refresh.side_effect = fake_refresh
    preference = repo.upsert(user_id=1, preferred_city="Rome", units="metric")

    assert preference.user_id == 1
    assert preference.preferred_city == "Rome"
    assert preference.units == "metric"
    session.add.assert_called_once()
    session.commit.assert_called_once()
    session.refresh.assert_called_once()


def test_upsert_updates_existing_preference(mocker):
    existing = mocker.Mock(user_id=2, preferred_city="Old", units="metric")
    repo, session = _build_repo_with_query_first_result(mocker, first_result=existing)

    preference = repo.upsert(user_id=2, preferred_city="Berlin", units="imperial")

    assert preference is existing
    assert existing.preferred_city == "Berlin"
    assert existing.units == "imperial"
    session.add.assert_not_called()
    session.commit.assert_called_once()


def test_upsert_raises_conflict_error_on_integrity_failure(mocker):
    repo, session = _build_repo_with_query_first_result(mocker, first_result=None)
    session.commit.side_effect = IntegrityError("insert", {}, Exception("dup"))

    with pytest.raises(PreferenceConflictError):
        repo.upsert(user_id=3, preferred_city="Madrid", units="metric")
    session.rollback.assert_called_once()


def test_upsert_raises_storage_error_on_generic_db_failure(mocker):
    repo, session = _build_repo_with_query_first_result(mocker, first_result=None)
    session.commit.side_effect = SQLAlchemyError("db down")

    with pytest.raises(PreferenceStorageError):
        repo.upsert(user_id=4, preferred_city="Dublin", units="metric")
    session.rollback.assert_called_once()


def test_get_by_user_id_returns_preference_when_found(mocker):
    existing = mocker.Mock(user_id=9, preferred_city="Lisbon", units="metric")
    repo, _session = _build_repo_with_query_first_result(mocker, first_result=existing)

    result = repo.get_by_user_id(9)
    assert result is existing


def test_get_by_user_id_returns_none_when_missing(mocker):
    repo, _session = _build_repo_with_query_first_result(mocker, first_result=None)
    assert repo.get_by_user_id(99) is None


def test_get_by_user_id_raises_storage_error_on_query_failure(mocker):
    session = mocker.Mock()
    query = session.query.return_value
    query.filter.side_effect = SQLAlchemyError("query failed")
    repo = SqlAlchemyUserPreferenceRepository(session)

    with pytest.raises(PreferenceStorageError):
        repo.get_by_user_id(11)
