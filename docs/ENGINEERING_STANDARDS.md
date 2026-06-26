# ENGINEERING_STANDARDS.md

# Engineering Standards

Version: 1.0

Status: Locked Before Development

Purpose: Define mandatory engineering rules for the project.

---

# 1. Golden Rule

Every implementation must follow this sequence.

Requirement

↓

Architecture

↓

Design

↓

Review

↓

Implementation

↓

Testing

↓

Documentation

↓

Git Commit

↓

Code Review

↓

Deployment

Never skip a step.

---

# 2. Git Workflow

Main Branches

main

Production-ready code only.

develop

Current development.

Feature Branches

feature/authentication

feature/products

feature/cart

feature/orders

feature/payments

feature/admin-dashboard

Bug Fix Branches

bugfix/login-token

bugfix/cart-total

Hotfix Branches

hotfix/payment-verification

Never work directly on main.

---

# 3. Commit Message Standard

Format

<type>(scope): description

Examples

feat(auth): implement Google OAuth login

feat(products): add product listing API

fix(cart): correct total calculation

docs(api): update authentication endpoints

refactor(order): simplify order service

test(payment): add payment verification tests

chore(project): update dependencies

Allowed Types

feat

fix

docs

refactor

test

style

perf

build

ci

chore

---

# 4. Branch Naming Convention

feature/<feature-name>

bugfix/<issue-name>

hotfix/<issue-name>

release/<version>

Examples

feature/google-auth

feature/product-search

bugfix/payment-timeout

release/v1.0.0

---

# 5. Folder Naming Convention

Use lowercase.

Use hyphens only when necessary.

Examples

controllers

services

middleware

product-service

Never

Controllers

ProductService

product_service

---

# 6. File Naming Convention

Backend

camelCase for utilities

authService.ts

productRepository.ts

PascalCase only for classes.

Frontend Components

PascalCase

ProductCard.tsx

CheckoutForm.tsx

Navbar.tsx

Hooks

useAuth.ts

useCart.ts

useProducts.ts

Constants

UPPER_SNAKE_CASE only for constant values.

---

# 7. Code Organization

Controllers

Receive request

Return response

Nothing else.

Services

Business logic only.

Repositories

Database access only.

Validators

Validation only.

Utilities

Reusable helper functions.

---

# 8. Function Rules

Every function should:

Have one responsibility.

Return predictable results.

Handle errors.

Be easy to test.

Avoid functions longer than approximately 50 lines unless clearly justified.

---

# 9. API Rules

Use REST.

Version every endpoint.

Use consistent responses.

Validate every request.

Never expose stack traces.

Always return proper HTTP status codes.

---

# 10. Database Rules

Use UUID primary keys.

Never hard delete business data.

Use foreign keys.

Use indexes.

Follow snake_case.

Always include audit fields.

---

# 11. Security Rules

Never commit secrets.

Use environment variables.

Validate every input.

Use parameterized queries.

Use HTTPS.

Hash passwords.

Verify JWT.

Implement RBAC.

Log security events.

---

# 12. Testing Rules

Every feature must include:

Happy path.

Validation failures.

Authorization failures.

Edge cases.

Regression checks before completion.

---

# 13. Code Review Checklist

Before marking a task complete:

□ Code compiles.

□ Lint passes.

□ Tests pass.

□ Business rules followed.

□ Documentation updated.

□ No duplicated logic.

□ Security reviewed.

□ Performance considered.

□ Git commit completed.

---

# 14. Documentation Rules

Update documentation whenever:

Architecture changes.

Database changes.

API changes.

Business rules change.

Feature completes.

Never allow documentation to become outdated.

---

# 15. Daily Workflow

Start

Read PROJECT_STATUS.md

Review today's objective.

Understand the task.

Ask AI to explain.

Review architecture.

Generate one file.

Run tests.

Review code.

Commit.

Update documentation.

End

Record lessons learned.

Prepare tomorrow's task.

---

# 16. Definition of Done

A feature is complete only when:

✓ Business requirement implemented

✓ Architecture followed

✓ Code reviewed

✓ Tests passed

✓ Documentation updated

✓ Git committed

✓ PROJECT_STATUS.md updated

✓ PM acceptance criteria satisfied

Status: Locked Before Development
