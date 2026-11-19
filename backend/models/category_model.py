from extensions import db


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)
    slug = db.Column(db.String(80), nullable=False, unique=True, index=True)
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    products = db.relationship("Product", back_populates="category", lazy="selectin")

    def to_dict(self, product_count=None):
        data = {"id": self.id, "name": self.name, "slug": self.slug}
        if product_count is not None:
            data["product_count"] = product_count
        return data
