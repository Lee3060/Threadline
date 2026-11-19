"""Create the MySQL database and tables, then add the sample catalogue.

    python -m scripts.init_db          # create if missing, add products only when empty
    python -m scripts.init_db --reset  # drop all tables and start fresh
"""
import argparse
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pymysql  # noqa: E402

from app import create_app  # noqa: E402
from config import Config  # noqa: E402
from extensions import db  # noqa: E402
from models import Category, Product  # noqa: E402
from scripts.seed_data import CATEGORIES, PRODUCTS  # noqa: E402


def create_database():
    conn = pymysql.connect(
        host=os.getenv("DB_HOST", "127.0.0.1"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
    )
    with conn.cursor() as cur:
        cur.execute(
            f"CREATE DATABASE IF NOT EXISTS `{Config.DB_NAME}` "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
    conn.close()
    print(f"Database `{Config.DB_NAME}` is ready")


def seed():
    if Product.query.first():
        print("Products already exist, skipping sample data (use --reset to start fresh)")
        return
    by_slug = {}
    for order, c in enumerate(CATEGORIES):
        by_slug[c["slug"]] = Category(name=c["name"], slug=c["slug"], sort_order=order)
    db.session.add_all(by_slug.values())

    now = datetime.now(timezone.utc)
    for cat, name, price, mrp, desc, image, rating, reviews, stock, days_old in PRODUCTS:
        db.session.add(Product(
            category=by_slug[cat], name=name, slug=image, price=price, mrp=mrp,
            short_description=desc, image_url=f"/products/{image}.svg", rating=rating,
            review_count=reviews, stock=stock, created_at=now - timedelta(days=days_old),
        ))
    db.session.commit()
    print(f"Added {len(CATEGORIES)} categories and {len(PRODUCTS)} products")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="drop all tables first")
    args = parser.parse_args()

    create_database()
    app = create_app()
    with app.app_context():
        if args.reset:
            db.drop_all()
            print("Dropped all tables")
        db.create_all()
        print("Tables: " + ", ".join(sorted(db.metadata.tables)))
        seed()


if __name__ == "__main__":
    main()
