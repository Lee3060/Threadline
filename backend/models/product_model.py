from datetime import datetime, timezone

from extensions import db


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(140), nullable=False, unique=True)
    price = db.Column(db.Numeric(10, 2), nullable=False, index=True)
    mrp = db.Column(db.Numeric(10, 2), nullable=False)
    short_description = db.Column(db.String(255), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Numeric(2, 1), nullable=False, default=0)
    review_count = db.Column(db.Integer, nullable=False, default=0)
    stock = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    category = db.relationship("Category", back_populates="products", lazy="joined")

    def to_dict(self):
        price, mrp = float(self.price), float(self.mrp)
        return {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "price": price,
            "mrp": mrp,
            "discount_percent": round((mrp - price) / mrp * 100) if mrp > price else 0,
            "short_description": self.short_description,
            "image_url": self.image_url,
            "rating": float(self.rating),
            "review_count": self.review_count,
            "in_stock": self.stock > 0,
            "stock": self.stock,
            "category": {"id": self.category.id, "name": self.category.name, "slug": self.category.slug},
        }
