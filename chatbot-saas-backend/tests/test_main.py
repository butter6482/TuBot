import pytest
from fastapi.testclient import TestClient

USER_MSG = {"messages": [{"role": "user", "content": "hola"}]}


# ---------- basic routes ----------

def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert body["service"] == "tubot-backend"


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}


def test_favicon_returns_no_content(client):
    assert client.get("/favicon.ico").status_code == 204


def test_diag_reports_flags_without_leaking_secrets(client, main_module, monkeypatch):
    monkeypatch.setattr(main_module, "SUPABASE_ANON_KEY", "super-secret-anon-key")
    body = client.get("/api/_diag").json()
    assert body["persistent_bots"] is False
    assert body["anon_key"] is True  # a boolean, never the key itself
    assert "super-secret-anon-key" not in client.get("/api/_diag").text


# ---------- request validation ----------

@pytest.mark.parametrize(
    "payload",
    [
        {},  # missing messages
        {"messages": [{"role": "hacker", "content": "x"}]},  # invalid role
        {"messages": [{"role": "user"}]},  # missing content
        {**USER_MSG, "instructions": "x" * 1001},  # instructions too long
    ],
)
def test_chatbot_message_rejects_invalid_payloads(client, payload):
    assert client.post("/chatbot/message", json=payload).status_code == 422


def test_api_chat_requires_message(client):
    assert client.post("/api/chat", json={}).status_code == 422


# ---------- OpenRouter integration (stubbed) ----------

def test_missing_api_key_returns_500_with_clear_message(client, main_module, monkeypatch):
    monkeypatch.setattr(main_module, "OPENROUTER_API_KEY", None)
    r = client.post("/chatbot/message", json=USER_MSG)
    assert r.status_code == 500
    assert "OPENROUTER_API_KEY" in r.json()["detail"]


def test_chatbot_message_returns_reply_and_forwards_payload(
    client, main_module, monkeypatch, fake_client_factory, openrouter_ok
):
    Fake, Resp = fake_client_factory
    fake = Fake(response=Resp(openrouter_ok))
    monkeypatch.setattr(main_module, "OPENROUTER_API_KEY", "test-key")
    monkeypatch.setattr(main_module, "client", fake)

    r = client.post(
        "/chatbot/message",
        json={**USER_MSG, "instructions": "Eres un bot amable", "model": "test/model"},
    )

    assert r.status_code == 200
    assert r.json() == {"reply": "hola desde el bot", "model_used": "test/model", "tokens_used": 42}

    sent = fake.calls[0]
    assert sent["headers"]["Authorization"] == "Bearer test-key"
    assert sent["json"]["model"] == "test/model"
    # instructions are sent as the first (system) message
    assert sent["json"]["messages"][0] == {"role": "system", "content": "Eres un bot amable"}
    assert sent["json"]["messages"][1] == {"role": "user", "content": "hola"}


def test_api_chat_alias_uses_default_model(client, main_module, monkeypatch, fake_client_factory, openrouter_ok):
    Fake, Resp = fake_client_factory
    fake = Fake(response=Resp(openrouter_ok))
    monkeypatch.setattr(main_module, "OPENROUTER_API_KEY", "test-key")
    monkeypatch.setattr(main_module, "client", fake)

    r = client.post("/api/chat", json={"message": "hola"})

    assert r.status_code == 200
    assert r.json()["reply"] == "hola desde el bot"
    assert fake.calls[0]["json"]["model"] == "mistralai/mistral-7b-instruct"
    # no instructions -> no system message
    assert fake.calls[0]["json"]["messages"] == [{"role": "user", "content": "hola"}]


def test_upstream_http_error_becomes_502(client, main_module, monkeypatch, fake_client_factory):
    Fake, Resp = fake_client_factory
    fake = Fake(response=Resp(status=429, text="rate limited"))
    monkeypatch.setattr(main_module, "OPENROUTER_API_KEY", "test-key")
    monkeypatch.setattr(main_module, "client", fake)

    r = client.post("/chatbot/message", json=USER_MSG)

    assert r.status_code == 502
    assert "rate limited" in r.json()["detail"]


def test_unexpected_error_does_not_leak_internals(client, main_module, monkeypatch, fake_client_factory):
    Fake, _ = fake_client_factory
    fake = Fake(error=RuntimeError("db password is hunter2"))
    monkeypatch.setattr(main_module, "OPENROUTER_API_KEY", "test-key")
    monkeypatch.setattr(main_module, "client", fake)

    r = client.post("/chatbot/message", json=USER_MSG)

    assert r.status_code == 500
    assert "hunter2" not in r.text


# ---------- persistent bots (feature flag) ----------

@pytest.mark.parametrize("method", ["GET", "POST", "DELETE"])
def test_bot_endpoints_are_gone_when_feature_flag_is_off(client, method):
    assert client.request(method, "/api/bot").status_code == 410


def test_bot_endpoints_require_bearer_token_when_enabled(monkeypatch, clean_env):
    monkeypatch.setenv("PERSISTENT_BOTS", "true")
    import importlib

    import app.main as main

    main = importlib.reload(main)
    try:
        c = TestClient(main.app)
        assert c.get("/api/bot").status_code == 401
        assert c.get("/api/bot", headers={"Authorization": "Basic abc"}).status_code == 401
        assert c.post("/api/bot", json={"name": "x"}).status_code == 401
    finally:
        monkeypatch.delenv("PERSISTENT_BOTS", raising=False)
        importlib.reload(main)


def test_bot_endpoints_fail_closed_without_supabase_config(monkeypatch, clean_env):
    monkeypatch.setenv("PERSISTENT_BOTS", "true")
    import importlib

    import app.main as main

    main = importlib.reload(main)
    try:
        r = TestClient(main.app).get("/api/bot", headers={"Authorization": "Bearer some-token"})
        assert r.status_code == 500  # misconfigured server must not authenticate anyone
    finally:
        monkeypatch.delenv("PERSISTENT_BOTS", raising=False)
        importlib.reload(main)
