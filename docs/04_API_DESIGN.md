# API Design

This document describes the REST API endpoints and request/response structures.

## Endpoints

### Auth
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate user and receive token

### Products
- `GET /api/products` - Retrieve list of products (with filtering/pagination)
- `GET /api/products/:id` - Retrieve details of a single product

### Orders
- `POST /api/orders` - Place a new order
- `GET /api/orders` - List current user's order history
