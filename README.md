# Threadline – Product Listing Page

Threadline is a product listing application for an innerwear store, built using React, Python (Flask), and MySQL. It includes product browsing, search, filters, sorting, and a persistent guest shopping cart.

## Features

- **Product listing:** 18 products across 6 categories, with images, pricing, discounts, ratings, and descriptions.
- **Search and filters:** Search products by name, description, or category. Filter by category and price range.
- **Sorting:** Sort by featured products, price, newest, or customer ratings.
- **URL-based filters:** Search and filter selections are reflected in the URL, making it possible to share links and retain filters after refreshing.
- **Shopping cart:** Add products, update quantities, remove items, or clear the cart.
- **Cart summary:** Displays subtotal, savings, 5% GST, shipping charges, and final amount.
- **Guest cart:** Cart data is stored in MySQL and remains available after refreshing the page.
- **Responsive design:** Works across desktop, tablet, and mobile screens.
- **Additional UI features:** Light/dark mode, loading states, notifications, empty states, and out-of-stock handling.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 6, React Router 7, Axios, Lucide React |
| Backend | Python 3.11, Flask 3, Flask-SQLAlchemy, Flask-CORS |
| Database | MySQL, PyMySQL |
| Testing | Pytest, Vitest, React Testing Library |
| Styling | Custom CSS |

## Project Structure

```text
dependency/
├── README.md
├── PROJECT_PLAN.md
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── core/
│   ├── models/
│   ├── features/
│   │   ├── products/
│   │   ├── categories/
│   │   └── cart/
│   ├── scripts/
│   └── tests/
└── frontend/
    ├── public/products/
    ├── scripts/
    └── src/
        ├── app/
        ├── api/
        ├── features/
        │   ├── products/
        │   └── cart/
        ├── components/
        └── utils/
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Python 3.11+
- Node.js 20+
- MySQL

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env
```

Update your database credentials in the `.env` file.

Initialize the database:

```bash
python -m scripts.init_db
```

This creates the database, required tables, and sample product data.

### 2. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

### 3. Run the Application

Start the backend:

```bash
cd backend
python app.py
```

The Flask API runs at `http://127.0.0.1:5001`.

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3001`.

Vite proxies API requests to the Flask backend.

## Testing

Run the backend tests:

```bash
cd backend
pytest
```

Run the frontend tests:

```bash
cd frontend
npm test
```

Run the frontend linter:

```bash
cd frontend
npm run lint
```

The project currently includes 35 backend tests and 27 frontend tests.

Backend tests use an in-memory SQLite database, so a running MySQL server is not required for testing.

## API Documentation

The backend provides Swagger UI for exploring and testing API endpoints.

Start the backend and open:

`http://127.0.0.1:5001/api/docs`

All API endpoints are available under the `/api` prefix.

### Available Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Get products with search, filters, and sorting |
| GET | `/api/products/<id>` | Get product details |
| GET | `/api/categories` | Get product categories |
| GET | `/api/cart` | Retrieve guest cart |
| POST | `/api/cart/items` | Add product to cart |
| PATCH | `/api/cart/items/<product_id>` | Update item quantity |
| DELETE | `/api/cart/items/<product_id>` | Remove an item |
| DELETE | `/api/cart` | Clear the cart |

Successful responses follow this structure:

```json
{
  "success": true,
  "data": {}
}
```

### Cart Pricing Rules

- Product prices are exclusive of GST.
- GST is calculated at a flat rate of 5%.
- Shipping costs ₹49 for orders below ₹999.
- Shipping is free for orders of ₹999 or more.

All cart calculations are handled by the backend using Python's `Decimal` to maintain accurate monetary values.

## How Guest Cart Works

Threadline does not require users to log in.

When a user visits the application for the first time, the frontend generates a UUID and stores it in browser `localStorage`.

This token is sent with cart API requests using the `X-Cart-Token` header. The backend uses it to identify the user's cart in MySQL.

This allows users to retain their cart even after refreshing the page.

