from flask import Blueprint

from core.responses import ok
from features.categories import service

categories_bp = Blueprint("categories", __name__)


@categories_bp.get("/categories")
def list_categories():
    return ok(service.list_categories())
