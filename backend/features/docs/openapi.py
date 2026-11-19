"""OpenAPI 3 description of the API. Swagger UI at /api/docs reads it from /api/openapi.json.

When you add or change an endpoint, update its entry in PATHS below.
"""
from features.cart.service import GST_RATE_PERCENT, MAX_QTY_PER_ITEM
from features.products.schemas import SORT_OPTIONS

EXAMPLE_TOKEN = "3f2a9c1e-1234-4abc-9def-1234567890ab"


def _ok(schema_ref, description="OK"):
    """A success response wrapped in {"success": true, "data": ...}."""
    return {
        "description": description,
        "content": {"application/json": {"schema": {
            "type": "object",
            "properties": {
                "success": {"type": "boolean", "example": True},
                "data": schema_ref,
            },
        }}},
    }


def _err(description):
    return {"description": description,
            "content": {"application/json": {"schema": {"$ref": "#/components/schemas/Error"}}}}


CART_TOKEN = {"$ref": "#/components/parameters/CartToken"}
PRODUCT_ID = {"name": "product_id", "in": "path", "required": True, "schema": {"type": "integer", "example": 1}}
CART_OK = _ok({"$ref": "#/components/schemas/Cart"})

PATHS = {
    "/health": {
        "get": {
            "tags": ["System"], "summary": "Is the API running?",
            "responses": {"200": _ok({"type": "object", "properties": {"status": {"type": "string", "example": "ok"}}})},
        }
    },
    "/products": {
        "get": {
            "tags": ["Products"], "summary": "List products (filter, search, sort)",
            "description": "Only active products. All filters can be combined.",
            "parameters": [
                {"name": "category", "in": "query", "description": "Category slug, e.g. `socks`",
                 "schema": {"type": "string"}},
                {"name": "search", "in": "query", "description": "Searches name, description and category name",
                 "schema": {"type": "string"}},
                {"name": "sort", "in": "query",
                 "schema": {"type": "string", "enum": list(SORT_OPTIONS), "default": "featured"}},
                {"name": "min_price", "in": "query", "schema": {"type": "number", "minimum": 0}},
                {"name": "max_price", "in": "query", "schema": {"type": "number", "minimum": 0}},
            ],
            "responses": {
                "200": _ok({"$ref": "#/components/schemas/ProductList"}),
                "422": _err("Invalid sort, negative price, or min_price > max_price"),
            },
        }
    },
    "/products/{product_id}": {
        "get": {
            "tags": ["Products"], "summary": "Get one product",
            "parameters": [PRODUCT_ID],
            "responses": {
                "200": _ok({"$ref": "#/components/schemas/Product"}),
                "404": _err("Product missing or inactive"),
            },
        }
    },
    "/categories": {
        "get": {
            "tags": ["Categories"], "summary": "List categories with product counts",
            "responses": {"200": _ok({"type": "array", "items": {"$ref": "#/components/schemas/Category"}})},
        }
    },
    "/cart": {
        "get": {
            "tags": ["Cart"], "summary": "Get the cart for this token",
            "description": "An unknown token returns an empty cart (nothing is created).",
            "parameters": [CART_TOKEN],
            "responses": {"200": CART_OK, "400": _err("Missing or invalid X-Cart-Token")},
        },
        "delete": {
            "tags": ["Cart"], "summary": "Clear the cart",
            "parameters": [CART_TOKEN],
            "responses": {"200": CART_OK, "400": _err("Missing or invalid X-Cart-Token")},
        },
    },
    "/cart/items": {
        "post": {
            "tags": ["Cart"], "summary": "Add a product to the cart",
            "description": "Creates the cart on the first add. Adding the same product again increases its quantity.",
            "parameters": [CART_TOKEN],
            "requestBody": {"required": True, "content": {"application/json": {"schema": {
                "type": "object", "required": ["product_id"],
                "properties": {
                    "product_id": {"type": "integer", "example": 1},
                    "quantity": {"type": "integer", "minimum": 1, "maximum": MAX_QTY_PER_ITEM, "default": 1,
                                 "example": 1},
                },
            }}}},
            "responses": {
                "201": _ok({"$ref": "#/components/schemas/Cart"}, "Added, returns the full cart"),
                "400": _err("Missing or invalid X-Cart-Token"),
                "404": _err("Product missing or inactive"),
                "422": _err("VALIDATION_ERROR, OUT_OF_STOCK or QTY_LIMIT"),
            },
        }
    },
    "/cart/items/{product_id}": {
        "patch": {
            "tags": ["Cart"], "summary": "Set the quantity of a cart item",
            "parameters": [CART_TOKEN, PRODUCT_ID],
            "requestBody": {"required": True, "content": {"application/json": {"schema": {
                "type": "object", "required": ["quantity"],
                "properties": {"quantity": {"type": "integer", "minimum": 1, "maximum": MAX_QTY_PER_ITEM,
                                            "example": 3}},
            }}}},
            "responses": {
                "200": CART_OK,
                "404": _err("This item is not in your cart"),
                "422": _err("VALIDATION_ERROR, OUT_OF_STOCK or QTY_LIMIT"),
            },
        },
        "delete": {
            "tags": ["Cart"], "summary": "Remove one item from the cart",
            "parameters": [CART_TOKEN, PRODUCT_ID],
            "responses": {"200": CART_OK, "404": _err("This item is not in your cart")},
        },
    },
}

COMPONENTS = {
    "parameters": {
        "CartToken": {
            "name": "X-Cart-Token", "in": "header", "required": True,
            "description": "Any UUID. The same token = the same cart. Use a new one for a fresh cart.",
            "schema": {"type": "string", "format": "uuid", "default": EXAMPLE_TOKEN},
        }
    },
    "schemas": {
        "Error": {"type": "object", "properties": {
            "success": {"type": "boolean", "example": False},
            "msg": {"type": "string", "example": "Only 3 left in stock"},
            "code": {"type": "string", "example": "OUT_OF_STOCK"},
            "details": {"type": "object", "description": "Field errors (only for VALIDATION_ERROR)"},
        }},
        "CategoryRef": {"type": "object", "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Men's Innerwear"},
            "slug": {"type": "string", "example": "mens-innerwear"},
        }},
        "Category": {"allOf": [{"$ref": "#/components/schemas/CategoryRef"}, {"type": "object", "properties": {
            "product_count": {"type": "integer", "example": 3},
        }}]},
        "Product": {"type": "object", "properties": {
            "id": {"type": "integer", "example": 1},
            "name": {"type": "string", "example": "Everyday Cotton Trunks (Pack of 3)"},
            "slug": {"type": "string", "example": "trunks-navy"},
            "price": {"type": "number", "example": 649.0},
            "mrp": {"type": "number", "example": 899.0},
            "discount_percent": {"type": "integer", "example": 28},
            "short_description": {"type": "string"},
            "image_url": {"type": "string", "example": "/products/trunks-navy.svg"},
            "rating": {"type": "number", "example": 4.5},
            "review_count": {"type": "integer", "example": 1284},
            "in_stock": {"type": "boolean", "example": True},
            "stock": {"type": "integer", "example": 120},
            "category": {"$ref": "#/components/schemas/CategoryRef"},
        }},
        "ProductList": {"type": "object", "properties": {
            "items": {"type": "array", "items": {"$ref": "#/components/schemas/Product"}},
            "total": {"type": "integer", "example": 18},
            "price_range": {"type": "object", "properties": {
                "min": {"type": "number", "example": 299.0},
                "max": {"type": "number", "example": 1899.0},
            }},
        }},
        "Cart": {"type": "object", "properties": {
            "items": {"type": "array", "items": {"type": "object", "properties": {
                "product": {"$ref": "#/components/schemas/Product"},
                "quantity": {"type": "integer", "example": 2},
                "line_total": {"type": "number", "example": 1298.0},
            }}},
            "summary": {"type": "object", "properties": {
                "item_count": {"type": "integer", "example": 2},
                "subtotal": {"type": "number", "example": 1298.0},
                "savings": {"type": "number", "example": 500.0},
                "gst_rate": {"type": "number", "example": float(GST_RATE_PERCENT)},
                "gst_amount": {"type": "number", "example": 64.9},
                "shipping": {"type": "number", "example": 0.0},
                "free_shipping_above": {"type": "number", "example": 999.0},
                "total": {"type": "number", "example": 1362.9},
            }},
            "max_qty_per_item": {"type": "integer", "example": MAX_QTY_PER_ITEM},
        }},
    },
}


def build_spec():
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "Threadline API",
            "version": "1.0.0",
            "description": (
                "Product listing + guest cart API for the Threadline store.\n\n"
                "Every success response is `{\"success\": true, \"data\": ...}`; every error is "
                "`{\"success\": false, \"msg\": ..., \"code\": ...}`.\n\n"
                f"Cart endpoints need the `X-Cart-Token` header (any UUID). GST is a flat "
                f"{GST_RATE_PERCENT}% on the subtotal."
            ),
        },
        "servers": [{"url": "/api"}],
        "tags": [{"name": "Products"}, {"name": "Categories"}, {"name": "Cart"}, {"name": "System"}],
        "paths": PATHS,
        "components": COMPONENTS,
    }
