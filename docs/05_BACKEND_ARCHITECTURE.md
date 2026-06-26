# 05_BACKEND_ARCHITECTURE.md

# Production Backend Architecture

Version: 1.0

Status: Approved

Language: TypeScript

Runtime: Node.js

Framework: Express.js

ORM: Prisma

Database: PostgreSQL

---

# 1. Purpose

This document defines the backend architecture for the Ecommerce Platform.

Every backend file must follow this architecture.

No developer is allowed to bypass the architecture without updating this document.

---

# 2. Backend Principles

Rule 1

One responsibility per file.

Rule 2

Business logic belongs in Services.

Rule 3

Controllers never contain business logic.

Rule 4

Database access belongs in the Repository layer.

Rule 5

Validation happens before business logic.

Rule 6

Every request must be logged.

Rule 7

Every error must be handled centrally.

Rule 8

Never hardcode configuration values.

---

# 3. Backend Folder Structure

backend/

src/

├── app.ts

├── server.ts

├── config/

├── routes/

├── controllers/

├── services/

├── repositories/

├── middleware/

├── validators/

├── schemas/

├── models/

├── prisma/

├── utils/

├── helpers/

├── constants/

├── types/

├── interfaces/

├── exceptions/

├── logger/

├── jobs/

├── uploads/

├── tests/

└── docs/

---

# 4. Layer Responsibilities

## Routes

Purpose

Receive HTTP requests.

Responsibilities

* Register endpoints.
* Apply middleware.
* Forward requests to controllers.

Never

* Validate business rules.
* Query the database.

---

## Controllers

Purpose

Coordinate request processing.

Responsibilities

* Receive validated request.
* Call service.
* Return HTTP response.

Never

* Write SQL.
* Call Prisma directly.
* Contain business rules.

---

## Services

Purpose

Business logic.

Responsibilities

* Implement business rules.
* Coordinate repositories.
* Execute workflows.

Examples

* Create Order
* Verify Payment
* Calculate Cart Total

---

## Repositories

Purpose

Database layer.

Responsibilities

* Read data.
* Insert data.
* Update data.
* Delete data.

Only repositories communicate with Prisma.

---

## Middleware

Purpose

Cross-cutting concerns.

Examples

Authentication

Authorization

Logging

Rate Limiting

Error Handling

Request ID

Validation

---

## Validators

Purpose

Validate incoming requests.

Examples

Email

Password

Product Price

Quantity

Coupon Code

Validation must fail before business logic executes.

---

## Config

Purpose

Application configuration.

Examples

Database

JWT

Environment

CORS

Rate Limits

Logging

---

## Logger

Purpose

Record application events.

Log

Server start

Login

Orders

Payments

Errors

Warnings

Performance

Never log passwords, tokens, or sensitive personal information.

---

# 5. Request Lifecycle

Client

↓

Express Route

↓

Middleware

↓

Validator

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

↓

Repository

↓

Service

↓

Controller

↓

Response

---

# 6. Dependency Rule

Allowed

Route

↓

Controller

↓

Service

↓

Repository

↓

Database

Not Allowed

Repository

↓

Controller

Service

↓

Route

Controller

↓

Repository (direct Prisma access)

---

# 7. Error Handling

Use one Global Error Handler.

Responsibilities

* Catch unexpected errors.
* Return consistent responses.
* Log errors.
* Hide internal implementation details.

Error Response

success

false

message

Human-readable message

code

Application error code

requestId

Unique request identifier

timestamp

Current time

---

# 8. Logging Strategy

Information

Application start

User login

Order creation

Payment success

Warnings

Invalid input

Rate limit exceeded

Errors

Database failure

Unhandled exception

Payment verification failure

---

# 9. Environment Variables

Only store configuration.

Examples

DATABASE_URL

JWT_SECRET

REFRESH_TOKEN_SECRET

GOOGLE_CLIENT_ID

GOOGLE_CLIENT_SECRET

RAZORPAY_KEY_ID

RAZORPAY_KEY_SECRET

Never commit .env files to Git.

---

# 10. Security Rules

Helmet

CORS

Rate Limiting

Input Validation

Parameterized Queries

Secure Cookies

JWT Verification

RBAC

Request Size Limits

File Upload Validation

---

# 11. Performance Rules

Pagination

Database Indexes

Avoid N+1 Queries

Compression

Connection Pooling

Lazy Loading where appropriate

---

# 12. Testing Strategy

Unit Tests

Services

Validators

Utilities

Integration Tests

Repositories

API Endpoints

End-to-End Tests

Authentication

Checkout

Payments

Orders

---

# 13. Code Review Checklist

Before merging code, verify:

□ Single responsibility followed

□ No duplicated code

□ No direct Prisma calls outside repositories

□ Validation implemented

□ Errors handled

□ Logging added where appropriate

□ Tests written

□ Documentation updated

---

# 14. Definition of Done

Backend architecture is complete only when:

✓ Folder structure approved

✓ Layer responsibilities documented

✓ Request lifecycle approved

✓ Dependency rules followed

✓ Security strategy documented

✓ Logging strategy documented

✓ Error handling standardized

✓ Testing strategy defined

Status: Ready for Backend Setup
