from datetime import datetime, timezone

from extensions import db


def _now():
    return datetime.now(timezone.utc)


class Cart(db.Model):
    """A guest cart, found by the token the browser keeps in localStorage."""
    __tablename__ = "carts"

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(36), nullable=False, unique=True, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=_now, onupdate=_now)

    items = db.relationship("CartItem", back_populates="cart", cascade="all, delete-orphan",
                            order_by="CartItem.id", lazy="selectin")


class CartItem(db.Model):
    __tablename__ = "cart_items"
    __table_args__ = (db.UniqueConstraint("cart_id", "product_id", name="uq_cart_product"),)

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey("carts.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    added_at = db.Column(db.DateTime, nullable=False, default=_now)

    cart = db.relationship("Cart", back_populates="items")
    product = db.relationship("Product", lazy="joined")
