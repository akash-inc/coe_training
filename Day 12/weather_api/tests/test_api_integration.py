def test_weather_endpoint_full_request_response_cycle(integration_client_fixture):
    client = integration_client_fixture
    first_response = client.get("/weather", params={"city": "ahmedabad", "units": "metric"})
    assert first_response.status_code == 200
    first_payload = first_response.json()
    assert first_payload["city"] == "Ahmedabad"
    assert first_payload["source"] == "api"

    second_response = client.get("/weather", params={"city": "ahmedabad", "units": "metric"})
    assert second_response.status_code == 200
    second_payload = second_response.json()
    assert second_payload["city"] == "Ahmedabad"
    assert second_payload["source"] == "cache"


def test_preferences_put_then_get_cycle(integration_client_fixture):
    client = integration_client_fixture
    create_response = client.put(
        "/preferences",
        json={"user_id": 101, "preferred_city": "Ahmedabad", "units": "metric"},
    )
    assert create_response.status_code == 200
    assert create_response.json() == {
        "user_id": 101,
        "preferred_city": "Ahmedabad",
        "units": "metric",
    }

    fetch_response = client.get("/preferences/101")
    assert fetch_response.status_code == 200
    assert fetch_response.json() == {
        "user_id": 101,
        "preferred_city": "Ahmedabad",
        "units": "metric",
    }


def test_preferences_update_then_get_cycle(integration_client_fixture):
    client = integration_client_fixture
    initial_response = client.put(
        "/preferences",
        json={"user_id": 202, "preferred_city": "Delhi", "units": "metric"},
    )
    assert initial_response.status_code == 200

    update_response = client.put(
        "/preferences",
        json={"user_id": 202, "preferred_city": "Mumbai", "units": "imperial"},
    )
    assert update_response.status_code == 200
    assert update_response.json() == {
        "user_id": 202,
        "preferred_city": "Mumbai",
        "units": "imperial",
    }

    fetch_response = client.get("/preferences/202")
    assert fetch_response.status_code == 200
    assert fetch_response.json() == {
        "user_id": 202,
        "preferred_city": "Mumbai",
        "units": "imperial",
    }


def test_preferences_get_missing_returns_404(integration_client_fixture):
    client = integration_client_fixture
    response = client.get("/preferences/999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Preferences not found"
