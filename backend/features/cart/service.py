import uuid
from decimal import ROUND_HALF_UP, Decimal

from core import database
from core.errors import ApiError, NotFound
from features.cart import repository as repo
from features.products import repository as product_repo
from models import Cart, CartItem

# Business rules: change them here
GST_RATE_PERCENT = Decimal("5")   # one flat GST rate on the cart subtotal
MAX_QTY_PER_ITEM = 10
FREE_SHIPPING_ABOVE = Decimal("999")
SHIPPING_FEE = Decimal("49")

_PAISE = Decimal("0.01")


def _money(value):
    return float(Decimal(value).quantize(_PAISE, rounding=ROUND_HALF_UP))


def validate_token(token):
    try:
        return str(uuid.UUID(str(token)))
    except (ValueError, TypeError):
        raise ApiError("A valid X-Cart-Token header is required", status=400, code="INVALID_CART_TOKEN")


def summarize(cart):
    """The cart as the frontend shows it. All money is worked out here, never in the browser."""
    items = cart.items if cart else []
    lines, subtotal, mrp_total, count = [], Decimal("0"), Decimal("0"), 0
    for item in items:
        product = item.product
        line_total = product.price * item.quantity
        subtotal += line_total
        mrp_total += product.mrp * item.quantity
        count += item.quantity
        lines.append({
            "product": product.to_dict(),
            "quantity": item.quantity,
            "line_total": _money(line_total),
        })

    gst = (subtotal * GST_RATE_PERCENT / 100).quantize(_PAISE, rounding=ROUND_HALF_UP)
    shipping = Decimal("0") if subtotal == 0 or subtotal >= FREE_SHIPPING_ABOVE else SHIPPING_FEE
    return {
        "items": lines,
        "summary": {
            "item_count": count,
            "subtotal": _money(subtotal),
            "savings": _money(mrp_total - subtotal),
            "gst_rate": float(GST_RATE_PERCENT),
            "gst_amount": _money(gst),
            "shipping": _money(shipping),
            "free_shipping_above": _money(FREE_SHIPPING_ABOVE),
            "total": _money(subtotal + gst + shipping),
        },
        "max_qty_per_item": MAX_QTY_PER_ITEM,
    }


def get_cart(token):
    return summarize(repo.find_cart(validate_token(token)))


def _check_quantity(product, quantity):
    if quantity > MAX_QTY_PER_ITEM:
        raise ApiError(f"You can add at most {MAX_QTY_PER_ITEM} of one item", status=422, code="QTY_LIMIT")
    if quantity > product.stock:
        raise ApiError(f"Only {product.stock} left in stock", status=422, code="OUT_OF_STOCK")


def add_item(token, product_id, quantity):
    token = validate_token(token)
    product = product_repo.find_active(product_id)
    if not product:
        raise NotFound("Product not found")

    cart = repo.find_cart(token) or database.add(Cart(token=token))
    item = repo.find_item(cart, product_id) if cart.id else None
    new_qty = (item.quantity if item else 0) + quantity
    _check_quantity(product, new_qty)

    if item:
        item.quantity = new_qty
    else:
        cart.items.append(CartItem(product_id=product.id, product=product, quantity=quantity))
    database.commit()
    return summarize(cart)


def _existing_item(token, product_id):
    cart = repo.find_cart(validate_token(token))
    item = repo.find_item(cart, product_id) if cart else None
    if not item:
        raise NotFound("This item is not in your cart")
    return cart, item


def update_item(token, product_id, quantity):
    cart, item = _existing_item(token, product_id)
    _check_quantity(item.product, quantity)
    item.quantity = quantity
    database.commit()
    return summarize(cart)


def remove_item(token, product_id):
    cart, item = _existing_item(token, product_id)
    cart.items.remove(item)
    database.commit()
    return summarize(cart)


def clear_cart(token):
    cart = repo.find_cart(validate_token(token))
    if cart:
        cart.items.clear()
        database.commit()
    return summarize(cart)
