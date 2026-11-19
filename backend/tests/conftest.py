import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app  # noqa: E402
from config import TestConfig  # noqa: E402
from extensions import db  # noqa: E402
from models import Category, Product  # noqa: E402


@pytest.fixture()
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        _seed()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def token():
    return str(uuid.uuid4())


def _seed():
    men = Category(name="Men's Innerwear", slug="mens-innerwear", sort_order=0)
    socks = Category(name="Socks", slug="socks", sort_order=1)
    empty = Category(name="Thermals", slug="thermals", sort_order=2)
    now = datetime.now(timezone.utc)
    db.session.add_all([
        men, socks, empty,
        Product(category=men, name="Cotton Trunks", slug="trunks", price=649, mrp=899,
                short_description="Breathable cotton trunks", image_url="/products/a.svg",
                rating=4.5, review_count=100, stock=50, created_at=now - timedelta(days=10)),
        Product(category=men, name="Ribbed Vest", slug="vest", price=299, mrp=399,
                short_description="Classic ribbed vest", image_url="/products/b.svg",
                rating=4.2, review_count=300, stock=5, created_at=now - timedelta(days=30)),
        Product(category=socks, name="Ankle Socks", slug="ankle", price=399, mrp=599,
                short_description="Cushioned ankle socks", image_url="/products/c.svg",
                rating=4.8, review_count=50, stock=100, created_at=now - timedelta(days=1)),
        Product(category=socks, name="Wool Socks", slug="wool", price=449, mrp=649,
                short_description="Warm wool blend", image_url="/products/d.svg",
                rating=4.7, review_count=20, stock=0, created_at=now),
        Product(category=socks, name="Hidden Socks", slug="hidden", price=199, mrp=199,
                short_description="Not for sale", image_url="/products/e.svg",
                stock=10, is_active=False),
    ])
    db.session.commit()


def product_id(name):
    return Product.query.filter_by(name=name).one().id
