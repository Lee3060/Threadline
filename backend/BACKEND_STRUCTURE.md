# Backend structure

The Flask API is organised **by feature**. Each feature folder has the same four files, and a request always flows through them in one direction:

```
HTTP request
   │
   ▼
routes.py      reads the request, validates it with a schema, calls the service, returns ok(...)
   │
   ▼
schemas.py     declares the allowed fields (type, required, default, min/max, choices)
   │
   ▼
service.py     business rules (GST, shipping, stock and quantity limits, money rounding)
   │
   ▼
repository.py  the only place that runs database queries (SQLAlchemy)
   │
   ▼
models/        table definitions
```

**Rules of thumb**
- Routes never touch the database. Repositories never raise HTTP errors.
- Services raise `ApiError` / `NotFound` from `core/errors.py`. The error handlers turn them into
  `{"success": false, "msg": ..., "code": ...}` with the right status code.
- Every success response goes through `core/responses.ok()` → `{"success": true, "data": ...}`.
- Writes go through `core/database.py` (`add`, `delete`, `commit`), which rolls back on error.

## Folders

| Path | What it holds |
|---|---|
| `app.py` | `create_app(config_class)`: config, extensions, blueprints, error handlers, `/api/health`. `python app.py` runs on `PORT` (5001). |
| `config.py` | `Config` (MySQL settings from `.env`) and `TestConfig` (in-memory SQLite) |
| `extensions.py` | The shared `db` (Flask-SQLAlchemy) and `cors` objects |
| `core/` | Shared code: errors, response helpers, DB write helpers, a small validation library (`Field` + `load`) |
| `models/` | `Category`, `Product`, `Cart`, `CartItem` |
| `features/products/` | `GET /api/products` (filter, search, sort, price range) and `GET /api/products/<id>` |
| `features/categories/` | `GET /api/categories` with product counts (one grouped query) |
| `features/cart/` | Guest cart by `X-Cart-Token`: get, add, update quantity, remove, clear; GST and shipping summary |
| `features/docs/` | Swagger UI at `/api/docs` and the OpenAPI spec at `/api/openapi.json` (`openapi.py` describes every endpoint) |
| `features/__init__.py` | `register_blueprints(app)`, all under `/api` |
| `scripts/seed_data.py` | 6 categories and 18 products |
| `scripts/init_db.py` | Creates the MySQL database (via PyMySQL), the tables, and the seed data. `--reset` drops and recreates the tables. |
| `tests/` | pytest suite (runs on in-memory SQLite, never touches MySQL) |

## Business rules

These live at the top of `features/cart/service.py`:

| Constant | Value | Meaning |
|---|---|---|
| `GST_RATE_PERCENT` | 5 | One flat GST rate on the subtotal. Listed prices exclude GST. |
| `MAX_QTY_PER_ITEM` | 10 | Most units of one product in a cart |
| `FREE_SHIPPING_ABOVE` | 999 | Subtotal at or above this ships free |
| `SHIPPING_FEE` | 49 | Charged below the free-shipping limit (₹0 for an empty cart) |

All money is calculated with `Decimal` and rounded HALF_UP to the paisa, on the backend only. The frontend just displays it.

## Adding a new feature

1. Create `features/<name>/` with `routes.py`, `schemas.py` (if it takes input), `service.py` and `repository.py`.
2. Add a model in `models/` if it needs a new table, and export it from `models/__init__.py`.
3. Register the blueprint in `features/__init__.py`.
4. Describe the endpoint in `features/docs/openapi.py` (a test fails if you forget).
5. Add tests in `tests/test_<name>.py` using the `client` fixture.
