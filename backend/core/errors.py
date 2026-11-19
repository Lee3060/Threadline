import logging

from flask import jsonify
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)


class ApiError(Exception):
    """Raise anywhere in a feature; it becomes {"success": false, "msg": ..., "code": ...}."""

    def __init__(self, msg, status=400, code="BAD_REQUEST", details=None):
        super().__init__(msg)
        self.msg = msg
        self.status = status
        self.code = code
        self.details = details


class NotFound(ApiError):
    def __init__(self, msg="Not found"):
        super().__init__(msg, status=404, code="NOT_FOUND")


def _error(msg, status, code, details=None):
    body = {"success": False, "msg": msg, "code": code}
    if details:
        body["details"] = details
    return jsonify(body), status


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(err):
        return _error(err.msg, err.status, err.code, err.details)

    @app.errorhandler(HTTPException)
    def handle_http_error(err):
        code = (err.name or "ERROR").upper().replace(" ", "_")
        return _error(err.description or err.name, err.code, code)

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        logger.exception("Unhandled error")
        return _error("Something went wrong. Please try again.", 500, "SERVER_ERROR")
