def register_blueprints(app):
    from features.cart.routes import cart_bp
    from features.categories.routes import categories_bp
    from features.docs.routes import docs_bp
    from features.products.routes import products_bp

    for bp in (products_bp, categories_bp, cart_bp, docs_bp):
        app.register_blueprint(bp, url_prefix="/api")
