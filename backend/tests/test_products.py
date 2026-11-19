from tests.conftest import product_id


def names(resp):
    return [p["name"] for p in resp.get_json()["data"]["items"]]


def test_health(client):
    assert client.get("/api/health").get_json()["data"]["status"] == "ok"


def test_lists_only_active_products_with_price_range(client):
    data = client.get("/api/products").get_json()["data"]
    assert data["total"] == 4
    assert "Hidden Socks" not in [p["name"] for p in data["items"]]
    assert data["price_range"] == {"min": 299.0, "max": 649.0}


def test_product_shape(client):
    item = client.get("/api/products?search=trunks").get_json()["data"]["items"][0]
    assert item["price"] == 649.0
    assert item["mrp"] == 899.0
    assert item["discount_percent"] == 28
    assert item["category"]["slug"] == "mens-innerwear"
    assert item["in_stock"] is True


def test_filter_by_category(client):
    assert names(client.get("/api/products?category=socks")) == ["Ankle Socks", "Wool Socks"]


def test_unknown_category_returns_empty_list(client):
    assert client.get("/api/products?category=nope").get_json()["data"]["total"] == 0


def test_sort_by_price(client):
    assert names(client.get("/api/products?sort=price_asc")) == \
        ["Ribbed Vest", "Ankle Socks", "Wool Socks", "Cotton Trunks"]
    assert names(client.get("/api/products?sort=price_desc")) == \
        ["Cotton Trunks", "Wool Socks", "Ankle Socks", "Ribbed Vest"]


def test_sort_newest_and_rating(client):
    assert names(client.get("/api/products?sort=newest"))[0] == "Wool Socks"
    assert names(client.get("/api/products?sort=rating"))[0] == "Ankle Socks"


def test_filter_and_sort_combined(client):
    resp = client.get("/api/products?category=socks&sort=price_desc")
    assert names(resp) == ["Wool Socks", "Ankle Socks"]


def test_search_matches_name_description_and_category(client):
    assert names(client.get("/api/products?search=VEST")) == ["Ribbed Vest"]
    assert names(client.get("/api/products?search=cushioned")) == ["Ankle Socks"]
    assert len(names(client.get("/api/products?search=men's"))) == 2


def test_price_range_filter(client):
    assert names(client.get("/api/products?min_price=300&max_price=450&sort=price_asc")) == \
        ["Ankle Socks", "Wool Socks"]


def test_invalid_sort_is_rejected(client):
    resp = client.get("/api/products?sort=cheapest")
    assert resp.status_code == 422
    assert resp.get_json()["code"] == "VALIDATION_ERROR"


def test_min_more_than_max_is_rejected(client):
    assert client.get("/api/products?min_price=500&max_price=100").status_code == 422


def test_get_one_product(client):
    resp = client.get(f"/api/products/{product_id('Ribbed Vest')}")
    assert resp.status_code == 200
    assert resp.get_json()["data"]["name"] == "Ribbed Vest"


def test_inactive_or_missing_product_is_404(client):
    assert client.get(f"/api/products/{product_id('Hidden Socks')}").status_code == 404
    assert client.get("/api/products/9999").status_code == 404


def test_categories_with_counts(client):
    data = client.get("/api/categories").get_json()["data"]
    assert [(c["slug"], c["product_count"]) for c in data] == \
        [("mens-innerwear", 2), ("socks", 2), ("thermals", 0)]


def test_unknown_route_is_json_404(client):
    resp = client.get("/api/nothing")
    assert resp.status_code == 404
    assert resp.get_json()["success"] is False
