"""Swagger UI for trying the API in the browser: http://127.0.0.1:5001/api/docs"""
from flask import Blueprint, jsonify

from features.docs.openapi import build_spec

docs_bp = Blueprint("docs", __name__)

SWAGGER_UI_VERSION = "5.17.14"
_CDN = f"https://cdn.jsdelivr.net/npm/swagger-ui-dist@{SWAGGER_UI_VERSION}"

_PAGE = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Threadline API docs</title>
  <link rel="stylesheet" href="{_CDN}/swagger-ui.css">
  <style>body {{ margin: 0; }} .swagger-ui .topbar {{ display: none; }}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="{_CDN}/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({{
      url: "/api/openapi.json",
      dom_id: "#swagger-ui",
      deepLinking: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 0
    }});
  </script>
</body>
</html>"""


@docs_bp.get("/openapi.json")
def openapi_json():
    return jsonify(build_spec())


@docs_bp.get("/docs")
def swagger_ui():
    return _PAGE, 200, {"Content-Type": "text/html; charset=utf-8"}
