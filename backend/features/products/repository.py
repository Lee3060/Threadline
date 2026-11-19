from sqlalchemy import func, or_

from extensions import db
from models import Category, Product

_ORDER_BY = {
    "featured": (Category.sort_order, Product.review_count.desc()),
    "price_asc": (Product.price.asc(),),
    "price_desc": (Product.price.desc(),),
    "newest": (Product.created_at.desc(),),
    "rating": (Product.rating.desc(), Product.review_count.desc()),
}


def list_products(category=None, search=None, min_price=None, max_price=None, sort="featured"):
    query = Product.query.join(Category).filter(Product.is_active.is_(True))
    if category:
        query = query.filter(Category.slug == category)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(like),
                                 Product.short_description.ilike(like),
                                 Category.name.ilike(like)))
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    # Product.id last so equal prices always come back in the same order
    return query.order_by(*_ORDER_BY[sort], Product.id).all()


def price_bounds():
    low, high = db.session.query(func.min(Product.price), func.max(Product.price)) \
        .filter(Product.is_active.is_(True)).one()
    return (float(low or 0), float(high or 0))


def find_active(product_id):
    return Product.query.filter_by(id=product_id, is_active=True).first()
