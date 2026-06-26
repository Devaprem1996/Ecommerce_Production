# Database Design

This document details the database schemas, tables, and relationships.

## Data Models

### Users
- `id` (UUID, PK)
- `email` (String, Unique)
- `password_hash` (String)
- `first_name` (String)
- `last_name` (String)
- `created_at` (Timestamp)

### Products
- `id` (UUID, PK)
- `name` (String)
- `description` (Text)
- `price` (Decimal)
- `stock` (Integer)
- `image_url` (String)
- `created_at` (Timestamp)

### Orders
- `id` (UUID, PK)
- `user_id` (UUID, FK -> Users)
- `total_amount` (Decimal)
- `status` (Enum: PENDING, PAID, SHIPPED, CANCELLED)
- `created_at` (Timestamp)
