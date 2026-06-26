# 06_CODE_REVIEW_CHECKLIST.md

# Engineering Code Review Checklist

Version: 1.0

Status: Approved

---

Before approving a Pull Request, the reviewer must check the code against the following standards:

## 1. Security & Compliance
* [ ] **Secrets**: No passwords, database credentials, keys, or API tokens are hardcoded.
* [ ] **SQL Injection**: Database accesses occur through Prisma parameters (no raw query concatenation).
* [ ] **Authentication**: Protected routes have auth/role middleware applied.
* [ ] **Input Validation**: All query parameters, paths, and body values are validated using Zod schemas.

## 2. Code Quality & Standards
* [ ] **Design Rules**: Adheres to Single Responsibility (thin controllers, logic in services, DB queries in repositories).
* [ ] **File Length**: No single function exceeds 50 lines. Files are focused.
* [ ] **Clean Naming**: Code follows naming conventions (PascalCase components, camelCase variables).

## 3. Performance & DB Efficiency
* [ ] **N+1 Queries**: Ensure nested relational fetches use Prisma `include` or batch loads rather than loops.
* [ ] **Pagination**: Read list endpoints enforce query parameters `page` and `limit`.
* [ ] **Indexing**: Queries filter by indexed fields where possible (e.g., SKU, email, slug).

## 4. Test Coverage
* [ ] **Coverage**: PR contains respective test configurations for new logic.
* [ ] **Results**: Local test execution passes with 0 failures.
