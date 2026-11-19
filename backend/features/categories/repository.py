from sqlalchemy import func

from extensions import db
from models import Category, Product


def categories_with_counts():
    """One query: every category with how many active products it has."""
    return (
        db.session.query(Category, func.count(Product.id))
        .outerjoin(Product, (Product.category_id == Category.id) & Product.is_active.is_(True))
        .group_by(Category.id)
        .order_by(Category.sort_order, Category.id)
        .all()
    )
