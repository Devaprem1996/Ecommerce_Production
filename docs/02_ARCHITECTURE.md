# 02_ARCHITECTURE.md

# Ecommerce Production Architecture

Version: 1.0

Status: Draft

---

# Purpose

This document defines the complete technical architecture of the Ecommerce application.

Every future coding decision must follow this document.

If a future implementation conflicts with this architecture, the architecture must be reviewed before coding continues.

---

# Business Goal

Create a production-ready ecommerce application that supports:

* User Registration
* Google Login
* Product Catalog
* Shopping Cart
* Checkout
* Payments
* Orders
* Admin Dashboard
* Analytics
* Deployment

---

# High-Level System Architecture

```
                Internet
                     │
                     ▼
             Frontend (Next.js)
                     │
                REST API
                     │
                     ▼
          Backend (Node.js + Express)
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
```

PostgreSQL      Cloud Storage      Redis (Future)
│
▼
Database

---

# Technology Decisions

Frontend

Next.js

Reason

Server-side rendering

Fast performance

SEO support

Easy routing

Production ready

---

Styling

Tailwind CSS

Reason

Fast development

Responsive

Industry standard

---

Backend

Node.js

Express.js

Reason

Large ecosystem

Fast

Simple

Production proven

---

Database

PostgreSQL

Reason

Reliable

ACID compliant

Scalable

Excellent relational support

---

Authentication

Google OAuth

JWT

Refresh Tokens

RBAC

Reason

Secure

Scalable

Easy to integrate

---

Payment

Razorpay Sandbox

Production Razorpay

Reason

Widely used in India

Good documentation

Reliable API

---

Cloud Storage

Cloudinary

Reason

Image optimization

CDN

Easy uploads

---

Version Control

Git

GitHub

---

Deployment

Frontend

Vercel

Backend

Railway

Database

Neon PostgreSQL

Future Migration

AWS

---

Architecture Principles

Single Responsibility

Every module has one job.

No duplicated logic.

Reusable services.

Controllers stay thin.

Business logic belongs inside services.

Validation before processing.

Logging every important action.

Error handling everywhere.

---

Backend Folder Structure

backend/

src/

config/

controllers/

services/

repositories/

middlewares/

routes/

validators/

models/

utils/

helpers/

constants/

types/

logs/

uploads/

tests/

app.js

server.js

---

Frontend Folder Structure

frontend/

app/

components/

layouts/

hooks/

services/

store/

styles/

utils/

types/

middleware/

public/

assets/

---

Request Lifecycle

Browser

↓

Frontend

↓

API Call

↓

Express Route

↓

Middleware

↓

Validation

↓

Controller

↓

Service

↓

Repository

↓

Database

↓

Repository

↓

Service

↓

Controller

↓

Response

↓

Frontend

↓

Browser

---

Authentication Flow

User clicks Login

↓

Google Authentication

↓

Google returns profile

↓

Backend verifies token

↓

Backend creates user

↓

JWT generated

↓

Refresh Token generated

↓

Cookies stored

↓

User redirected

---

Product Flow

Admin

↓

Create Product

↓

Validation

↓

Upload Image

↓

Save Database

↓

Return Success

↓

Frontend Updates

---

Cart Flow

User

↓

Add Product

↓

Check Stock

↓

Save Cart

↓

Calculate Total

↓

Return Cart

---

Checkout Flow

Cart

↓

Address

↓

Shipping

↓

Coupon

↓

Payment

↓

Create Order

↓

Reduce Stock

↓

Generate Invoice

↓

Confirmation

---

Order Flow

Order Created

↓

Pending

↓

Processing

↓

Shipped

↓

Out For Delivery

↓

Delivered

---

Admin Flow

Login

↓

Dashboard

↓

Products

↓

Orders

↓

Users

↓

Reports

↓

Logout

---

Error Handling Strategy

Every API returns

Success

or

Failure

Never both.

Error Response

Status Code

Message

Error Code

Timestamp

Request ID

---

Logging Strategy

Log

Login

Logout

Payments

Orders

Exceptions

Warnings

Server Startup

API Errors

Database Errors

---

Security Layers

HTTPS

JWT

RBAC

Helmet

Rate Limiting

Input Validation

Parameterized Queries

Password Hashing

Secure Cookies

CORS

Environment Variables

---

Scalability

Application should support

More users

More products

Multiple admins

Future mobile application

Microservices migration

Multiple payment gateways

Multiple warehouses

---

Coding Standards

Meaningful names

Small functions

No duplicate code

Maximum readability

Comments only when necessary

Always use TypeScript

Never hardcode secrets

---

Definition of Architecture Complete

Architecture is complete only if

✓ Folder structure approved

✓ Technology approved

✓ Database chosen

✓ API style decided

✓ Authentication designed

✓ Payment designed

✓ Deployment planned

✓ Security reviewed

END OF DOCUMENT
