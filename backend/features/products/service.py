from core.errors import ApiError, NotFound
from features.products import repository as repo


def list_products(filters):
    low, high = filters["min_price"], filters["max_price"]
    if low is not None and high is not None and low > high:
        raise ApiError("min_price cannot be more than max_price", status=422, code="VALIDATION_ERROR")

    products = repo.list_products(**filters)
    min_price, max_price = repo.price_bounds()
    return {
        "items": [p.to_dict() for p in products],
        "total": len(products),
        "price_range": {"min": min_price, "max": max_price},
    }


def get_product(product_id):
    product = repo.find_active(product_id)
    if not product:
        raise NotFound("Product not found")
    return product.to_dict()
