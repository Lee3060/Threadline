import pytest

from tests.conftest import product_id


def h(token):
    return {"X-Cart-Token": token}


def add(client, token, name, quantity=1):
    return client.post("/api/cart/items", json={"product_id": product_id(name), "quantity": quantity},
                       headers=h(token))


def test_new_token_has_empty_cart(client, token):
    data = client.get("/api/cart", headers=h(token)).get_json()["data"]
    assert data["items"] == []
    assert data["summary"]["item_count"] == 0
    assert data["summary"]["total"] == 0


@pytest.mark.parametrize("headers", [{}, {"X-Cart-Token": "not-a-uuid"}])
def test_token_is_required(client, headers):
    resp = client.get("/api/cart", headers=headers)
    assert resp.status_code == 400
    assert resp.get_json()["code"] == "INVALID_CART_TOKEN"


def test_add_item_and_totals_with_flat_gst(client, token):
    resp = add(client, token, "Cotton Trunks", 2)
    assert resp.status_code == 201
    s = resp.get_json()["data"]["summary"]
    assert s["item_count"] == 2
    assert s["subtotal"] == 1298.0
    assert s["gst_rate"] == 5.0
    assert s["gst_amount"] == 64.9
    assert s["shipping"] == 0.0           # above the free shipping limit
    assert s["savings"] == 500.0          # (899 - 649) * 2
    assert s["total"] == 1362.9


def test_shipping_added_below_free_limit(client, token):
    s = add(client, token, "Ribbed Vest").get_json()["data"]["summary"]
    assert s["subtotal"] == 299.0
    assert s["gst_amount"] == 14.95
    assert s["shipping"] == 49.0
    assert s["total"] == 362.95


def test_adding_same_product_increases_quantity(client, token):
    add(client, token, "Ankle Socks")
    data = add(client, token, "Ankle Socks", 2).get_json()["data"]
    assert len(data["items"]) == 1
    assert data["items"][0]["quantity"] == 3
    assert data["items"][0]["line_total"] == 1197.0


def test_cart_is_saved_per_token(client, token):
    add(client, token, "Ankle Socks")
    assert client.get("/api/cart", headers=h(token)).get_json()["data"]["summary"]["item_count"] == 1
    other = "11111111-1111-4111-8111-111111111111"
    assert client.get("/api/cart", headers=h(other)).get_json()["data"]["summary"]["item_count"] == 0


def test_cannot_add_more_than_stock(client, token):
    resp = add(client, token, "Ribbed Vest", 6)
    assert resp.status_code == 422
    assert resp.get_json()["code"] == "OUT_OF_STOCK"


def test_out_of_stock_product(client, token):
    assert add(client, token, "Wool Socks").get_json()["code"] == "OUT_OF_STOCK"


def test_quantity_limit_per_item(client, token):
    add(client, token, "Ankle Socks", 10)
    resp = add(client, token, "Ankle Socks", 1)
    assert resp.status_code == 422
    assert resp.get_json()["code"] == "QTY_LIMIT"


def test_add_validation(client, token):
    assert client.post("/api/cart/items", json={}, headers=h(token)).status_code == 422
    assert client.post("/api/cart/items", json={"product_id": "abc"}, headers=h(token)).status_code == 422
    assert client.post("/api/cart/items", json={"product_id": 1, "quantity": 0},
                       headers=h(token)).status_code == 422


def test_cannot_add_missing_or_inactive_product(client, token):
    assert add(client, token, "Hidden Socks").status_code == 404
    resp = client.post("/api/cart/items", json={"product_id": 9999}, headers=h(token))
    assert resp.status_code == 404


def test_update_quantity(client, token):
    add(client, token, "Cotton Trunks")
    resp = client.patch(f"/api/cart/items/{product_id('Cotton Trunks')}", json={"quantity": 4},
                        headers=h(token))
    assert resp.status_code == 200
    assert resp.get_json()["data"]["items"][0]["quantity"] == 4


def test_update_item_not_in_cart_is_404(client, token):
    resp = client.patch(f"/api/cart/items/{product_id('Cotton Trunks')}", json={"quantity": 2},
                        headers=h(token))
    assert resp.status_code == 404


def test_remove_item(client, token):
    add(client, token, "Cotton Trunks")
    add(client, token, "Ankle Socks")
    data = client.delete(f"/api/cart/items/{product_id('Cotton Trunks')}", headers=h(token)) \
        .get_json()["data"]
    assert [i["product"]["name"] for i in data["items"]] == ["Ankle Socks"]


def test_clear_cart(client, token):
    add(client, token, "Cotton Trunks")
    data = client.delete("/api/cart", headers=h(token)).get_json()["data"]
    assert data["items"] == []
    assert data["summary"]["total"] == 0
