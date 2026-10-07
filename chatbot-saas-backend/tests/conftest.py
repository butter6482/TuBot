import importlib

import httpx
import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def clean_env(monkeypatch):
    """Isolate tests from any real .env / shell configuration."""
    for var in ("OPENROUTER_API_KEY", "PERSISTENT_BOTS", "SUPABASE_URL", "SUPABASE_ANON_KEY",
                "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"):
        monkeypatch.delenv(var, raising=False)
    # load_dotenv() must not re-inject values from a developer's local .env during reloads
    monkeypatch.setattr("dotenv.load_dotenv", lambda *a, **k: False)


def _load_main():
    import app.main as main

    return importlib.reload(main)


@pytest.fixture
def main_module(clean_env):
    return _load_main()


@pytest.fixture
def client(main_module):
    return TestClient(main_module.app)


class FakeResponse:
    def __init__(self, payload=None, status=200, text=""):
        self._payload = payload or {}
        self.status_code = status
        self.text = text

    def raise_for_status(self):
        if self.status_code >= 400:
            request = httpx.Request("POST", "https://openrouter.ai/api/v1/chat/completions")
            response = httpx.Response(self.status_code, text=self.text, request=request)
            raise httpx.HTTPStatusError("upstream error", request=request, response=response)

    def json(self):
        return self._payload


class FakeAsyncClient:
    """Stands in for the module-level httpx.AsyncClient so no test touches the network."""

    def __init__(self, response=None, error=None):
        self.response = response or FakeResponse()
        self.error = error
        self.calls = []

    async def post(self, url, headers=None, json=None, **kwargs):
        self.calls.append({"url": url, "headers": headers, "json": json})
        if self.error:
            raise self.error
        return self.response

    async def aclose(self):
        pass


@pytest.fixture
def fake_client_factory():
    return FakeAsyncClient, FakeResponse


@pytest.fixture
def openrouter_ok():
    return {"choices": [{"message": {"content": "hola desde el bot"}}], "usage": {"total_tokens": 42}}
