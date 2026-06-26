# 07_DEFINITION_OF_DONE.md

# Engineering Definition of Done

Version: 1.0

Status: Approved

---

A task or user story is considered **Done** only when it meets the following criteria:

## 1. Code Standards
* [ ] **Compilation**: Code compiles with zero TypeScript errors or warnings.
* [ ] **Linting**: ESLint and Prettier check runs return zero code syntax warnings.
* [ ] **Review**: The code has been reviewed and approved by at least one engineer.

## 2. Test Verification
* [ ] **Unit Tests**: All new modules, service logic, and validation schemas have unit tests written.
* [ ] **E2E/Integration**: Routes and API calls are validated using local execution checks.
* [ ] **Regression**: Running the full test suite results in zero failures.

## 3. Operations & Documentation
* [ ] **Environment**: New environment keys are documented inside `.env.example`.
* [ ] **APIs**: The API contract is documented in [04_API_DESIGN.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/04_API_DESIGN.md).
* [ ] **Status Tracker**: [PROJECT_STATUS.md](file:///c:/Users/user/OneDrive/Ecommerce/ecommerce-production/docs/PROJECT_STATUS.md) is updated with task completion status.
