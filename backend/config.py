import os
from urllib.parse import quote_plus

from dotenv import load_dotenv

load_dotenv()


def mysql_url(database=None):
    """SQLAlchemy URL for the local MySQL server (database optional, used by init_db)."""
    user = os.getenv("DB_USER", "root")
    password = quote_plus(os.getenv("DB_PASSWORD", ""))
    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "3306")
    db_part = f"/{database}" if database else ""
    return f"mysql+pymysql://{user}:{password}@{host}:{port}{db_part}?charset=utf8mb4"


class Config:
    DB_NAME = os.getenv("DB_NAME", "dependency_store_db")
    SQLALCHEMY_DATABASE_URI = mysql_url(DB_NAME)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True, "pool_recycle": 280}

    CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:3001")
    JSON_SORT_KEYS = False


class TestConfig(Config):
    """Tests use an in-memory SQLite database, so they never touch MySQL."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS = {}
