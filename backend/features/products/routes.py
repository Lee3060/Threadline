from flask import Blueprint, request

from core.responses import ok
from core.validation import load
from features.products import service
from features.products.schemas import ListProductsQuery

products_bp = Blueprint("products", __name__)


@products_bp.get("/products")
def list_products():
    filters = load(ListProductsQuery, request.args)
    return ok(service.list_products(filters))


@products_bp.get("/products/<int:product_id>")
def get_product(product_id):
    return ok(service.get_product(product_id))
