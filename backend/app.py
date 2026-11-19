import logging
import os

from flask import Flask

from config import Config
from extensions import cors, db

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.json.sort_keys = False

    db.init_app(app)
    cors.init_app(app, resources={
        r"/api/*": {
            "origins": app.config["CORS_ORIGIN"],
            "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "X-Cart-Token"],
        }
    })

    # Imported here so models/features load after db is set up
    from core.errors import register_error_handlers
    from features import register_blueprints

    register_error_handlers(app)
    register_blueprints(app)

    @app.get("/api/health")
    def health():
        return {"success": True, "data": {"status": "ok"}}

    return app


if __name__ == "__main__":
    create_app().run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5001")),
        debug=os.getenv("FLASK_DEBUG") == "1",
    )
