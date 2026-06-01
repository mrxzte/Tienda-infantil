import pytest
import requests
import os
import uuid
from dotenv import load_dotenv
from pathlib import Path

# Load frontend .env so we get the public BACKEND URL
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API_URL = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@tienda.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def api_url():
    return API_URL


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(
        f"{API_URL}/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    if r.status_code != 200:
        pytest.skip(f"Cannot login admin: {r.status_code} {r.text}")
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def customer_credentials():
    # Use a unique customer per session
    unique = uuid.uuid4().hex[:8]
    return {
        "email": f"TEST_customer_{unique}@example.com",
        "password": "Password123!",
        "full_name": "TEST Customer",
        "phone": "3001112222",
        "address": "Calle Test 123",
    }


@pytest.fixture(scope="session")
def customer_token(session, customer_credentials):
    r = session.post(f"{API_URL}/auth/register", json=customer_credentials)
    if r.status_code == 400:
        # Already exists, login instead
        r = session.post(
            f"{API_URL}/auth/login",
            json={
                "email": customer_credentials["email"],
                "password": customer_credentials["password"],
            },
        )
    assert r.status_code in (200, 201), f"Customer registration/login failed: {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def customer_headers(customer_token):
    return {"Authorization": f"Bearer {customer_token}", "Content-Type": "application/json"}
