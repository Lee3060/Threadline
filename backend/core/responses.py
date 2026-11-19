from flask import jsonify


def ok(data=None, status=200):
    """Every successful response has the same shape: {"success": true, "data": ...}."""
    return jsonify({"success": True, "data": data}), status
