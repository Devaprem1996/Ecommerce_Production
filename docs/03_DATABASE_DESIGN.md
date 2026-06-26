# 03_DATABASE_DESIGN.md

# Production Database Design

Version: 2.0

Status: Approved for Development

Database: PostgreSQL

ORM: Prisma

Last Updated: Before Backend Development

---

# 1. Database Philosophy

The database is the single source of truth.

Rules:

* One table = One responsibility.
* Never duplicate data unless required for historical records.
* Every relationship must have a business reason.
* Every important action must be traceable.
* Design for future growth, not only today's requirements.

---

# 2. Database Standards

## Naming Convention

### Tables

Plural

Examples

users

user_profiles

products

categories

inventory

orders

payments

reviews

wishlist

addresses

audit_logs

---

### Columns

snake_case

Examples

first_name

created_at

updated_at

deleted_at

is_active

---

### Primary Key

Every table

id (UUID)

Reason

* Globally unique
* Better security
* Easier migrations
* Future microservice support

---

### Foreign Keys

user_id

product_id

category_id

order_id

payment_id

---

### Standard Audit Columns

Every table contains

id

created_at

updated_at

deleted_at (nullable)

created_by (nullable)

updated_by (nullable)

---

# 3. Business Modules

Authentication

↓

Users

↓

Profiles

↓

Addresses

↓

Categories

↓

Products

↓

Inventory

↓

Cart

↓

Wishlist

↓

Orders

↓

Order Items

↓

Payments

↓

Reviews

↓

Audit Logs

Future

Coupons

Notifications

Warehouse

Analytics

Support Tickets

---

# 4. Entity Relationship Overview

User

↓

User Profile

↓

Addresses

↓

Cart

↓

Orders

↓

Reviews

↓

Wishlist

Category

↓

Products

↓

Inventory

↓

Order Items

Order

↓

Payment

---

# 5. Table Design

---

## users

Purpose

Authentication and authorization only.

Columns

id

email

password_hash (nullable)

google_id

role

is_active

is_verified

last_login_at

created_at

updated_at

deleted_at

Relationship

One User

↓

One User Profile

↓

Many Addresses

↓

Many Orders

↓

Many Cart Items

↓

Many Reviews

↓

Many Wishlist Items

---

## user_profiles

Purpose

Stores personal profile information.

Columns

id

user_id

first_name

last_name

phone

avatar_url

date_of_birth (optional)

gender (optional)

created_at

updated_at

Reason

Authentication changes rarely.

Profile changes frequently.

Keeping them separate improves maintainability.

---

## addresses

Purpose

Stores delivery addresses.

Columns

id

user_id

full_name

phone

address_line_1

address_line_2

city

state

postal_code

country

landmark

is_default

created_at

updated_at

deleted_at

---

## categories

Purpose

Organize products.

Columns

id

name

slug

description

image_url

sort_order

is_active

created_at

updated_at

---

## products

Purpose

Stores product information.

Columns

id

category_id

name

slug

sku

brand

description

price

discount_price

thumbnail_url

weight

is_active

created_at

updated_at

deleted_at

Important

No stock information here.

Inventory owns stock.

On Category Deletion: Either category_id is set to NULL (category_id is nullable), or category deletion is blocked if it contains active products.

---

## inventory

Purpose

Manage stock independently.

Columns

id

product_id

available_quantity

reserved_quantity

minimum_stock

maximum_stock

last_stock_update

created_at

updated_at

Reason

Supports

Multiple warehouses

Reservations

Future inventory tracking

---

## cart

Purpose

Temporary shopping basket.

Columns

id

user_id

product_id

quantity

created_at

updated_at

Business Rule

Cart items must dynamically fetch the current live product price.

Never lock cart prices; prices are only locked inside order_items during successful checkout.

---

## wishlist

Purpose

Saved products.

Columns

id

user_id

product_id

created_at

Business Rule

One product can appear only once per user's wishlist.

---

## orders

Purpose

Customer purchases.

Columns

id

user_id

address_id

payment_id

order_number

subtotal

discount

tax

shipping_charge

grand_total

status

ordered_at

created_at

updated_at

deleted_at

---

## order_items

Purpose

Snapshot of purchased products.

Columns

id

order_id

product_id

product_name

sku

quantity

unit_price

discount

tax

subtotal

created_at

Reason

If product details change later,

the order history remains unchanged.

---

## payments

Purpose

Payment transaction records.

Columns

id

order_id

provider

provider_order_id

provider_payment_id

provider_signature

currency

amount

status

paid_at

failure_reason

created_at

updated_at

---

## reviews

Purpose

Customer reviews.

Columns

id

user_id

product_id

rating

title

comment

created_at

updated_at

Business Rule

Only verified purchasers can submit reviews.

---

## audit_logs

Purpose

Track every important system activity.

Columns

id

user_id

action

entity

entity_id

old_value (JSON)

new_value (JSON)

ip_address

user_agent

created_at

Examples

User Login

Product Updated

Order Cancelled

Payment Failed

Admin Deleted Product

Reason

Essential for debugging, compliance, and accountability.

---

# 6. Constraints

Unique

email

google_id

sku

slug

order_number

provider_payment_id

Validation

price >= 0

discount_price >= 0

available_quantity >= 0

rating between 1 and 5

quantity > 0

---

# 7. Indexes

Create indexes on

email

google_id

sku

slug

category_id

user_id

order_number

product_id

payment_id

created_at

status

Reason

Improve search and query performance.

---

# 8. Soft Delete Policy

Never permanently delete

Users

Orders

Payments

Products

Categories

Instead

Set

deleted_at

Reason

Data recovery

Audit history

Legal compliance

---

# 9. Future Expansion

Coupons

Inventory Transactions

Notifications

Warehouse

Supplier Management

Analytics

Reports

Refresh Tokens

User Sessions

Invoices

Returns

Refunds

Support Tickets

Multi-Vendor Marketplace

---

# 10. Database Rules

Rule 1

Never store duplicate information unless preserving history.

Rule 2

Never delete business data permanently.

Rule 3

Every table must have a clear owner.

Rule 4

Every foreign key must enforce referential integrity.

Rule 5

Historical records must never change.

---

# 11. Definition of Done

Database design is complete only when:

✓ Every entity documented

✓ Every relationship reviewed

✓ Every business rule defined

✓ Every constraint documented

✓ Every index identified

✓ Audit strategy approved

✓ Soft delete policy approved

✓ Future scalability considered

Status: Approved for Backend Development
