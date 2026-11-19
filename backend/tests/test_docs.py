import re

from features.docs.openapi import build_spec


def test_swagger_page(client):
    res = client.get("/api/docs")
    assert res.status_code == 200
    assert "text/html" in res.content_type
    assert b"swagger-ui-bundle.js" in res.data
    assert b"/api/openapi.json" in res.data


def test_openapi_json(client):
    spec = client.get("/api/openapi.json").get_json()
    assert spec["openapi"].startswith("3.")
    assert spec["servers"] == [{"url": "/api"}]


def test_spec_covers_every_api_route(app):
    """Fails if someone adds an endpoint but forgets to document it."""
    spec_paths = build_spec()["paths"]
    documented = {(path, method) for path, ops in spec_paths.items() for method in ops}
    skip = {"/docs", "/openapi.json"}
    for rule in app.url_map.iter_rules():
        if not rule.rule.startswith("/api/"):
            continue
        path = re.sub(r"<(?:\w+:)?(\w+)>", r"{\1}", rule.rule[len("/api"):])
        if path in skip:
            continue
        for method in rule.methods - {"HEAD", "OPTIONS"}:
            assert (path, method.lower()) in documented, f"{method} /api{path} is not in openapi.py"
