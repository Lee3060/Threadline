from flask import Blueprint, request

from core.responses import ok
from core.validation import load
from features.cart import service
from features.cart.schemas import AddItemRequest, UpdateItemRequest

cart_bp = Blueprint("cart", __name__)


def _token():
    return request.headers.get("X-Cart-Token")


@cart_bp.get("/cart")
def get_cart():
    return ok(service.get_cart(_token()))


@cart_bp.post("/cart/items")
def add_item():
    data = load(AddItemRequest, request.get_json(silent=True))
    return ok(service.add_item(_token(), data["product_id"], data["quantity"]), status=201)


@cart_bp.patch("/cart/items/<int:product_id>")
def update_item(product_id):
    data = load(UpdateItemRequest, request.get_json(silent=True))
    return ok(service.update_item(_token(), product_id, data["quantity"]))


@cart_bp.delete("/cart/items/<int:product_id>")
def remove_item(product_id):
    return ok(service.remove_item(_token(), product_id))


@cart_bp.delete("/cart")
def clear_cart():
    return ok(service.clear_cart(_token()))
