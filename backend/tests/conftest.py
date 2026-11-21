import os
import sys
from pathlib import Path

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

os.environ["TESTING"] = "1"
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.database as db_module
from app.database import Base, get_db
from app.main import app
from app.models import User, UserRole
from app.auth import hash_password, create_access_token

TEST_DB_PATH = os.path.abspath("./test_sketch2park.db")
TEST_DB_URL = f"sqlite:///{TEST_DB_PATH}"

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Point app's SessionLocal and engine to test database for background tasks
db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client():
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def designer_user(db):
    user = db.query(User).filter_by(username="test_designer").first()
    if not user:
        user = User(
            username="test_designer",
            email="designer@test.com",
            full_name="Test Designer",
            hashed_password=hash_password("pass123"),
            role=UserRole.DESIGNER,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@pytest.fixture
def reviewer_user(db):
    user = db.query(User).filter_by(username="test_reviewer").first()
    if not user:
        user = User(
            username="test_reviewer",
            email="reviewer@test.com",
            full_name="Test Reviewer",
            hashed_password=hash_password("pass123"),
            role=UserRole.REVIEWER,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@pytest.fixture
def other_reviewer_user(db):
    user = db.query(User).filter_by(username="test_unassigned_reviewer").first()
    if not user:
        user = User(
            username="test_unassigned_reviewer",
            email="other@test.com",
            full_name="Other Reviewer",
            hashed_password=hash_password("pass123"),
            role=UserRole.REVIEWER,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@pytest.fixture
def designer_token(designer_user):
    return create_access_token({"sub": designer_user.username, "role": designer_user.role.value})

@pytest.fixture
def reviewer_token(reviewer_user):
    return create_access_token({"sub": reviewer_user.username, "role": reviewer_user.role.value})

@pytest.fixture
def other_reviewer_token(other_reviewer_user):
    return create_access_token({"sub": other_reviewer_user.username, "role": other_reviewer_user.role.value})
