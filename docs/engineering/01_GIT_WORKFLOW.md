# 01_GIT_WORKFLOW.md

# Engineering Git Workflow

Version: 1.0

Status: Approved

---

## 1. Commit Message Standard
All commit messages must follow the **Conventional Commits** specification:
`<type>(<scope>): <description>`

### Allowed Types
* `feat`: A new feature (e.g., `feat(auth): implement Google OAuth callback`).
* `fix`: A bug fix (e.g., `fix(cart): resolve stock calculation overflow`).
* `docs`: Documentation changes only (e.g., `docs(readme): update environment setup details`).
* `style`: Styling changes that do not affect code logic (e.g., `style(theme): update primary button padding`).
* `refactor`: Code restructuring without modifying features or fixing bugs (e.g., `refactor(db): consolidate database query pools`).
* `test`: Adding or correcting tests (e.g., `test(auth): add JWT expiration edge case tests`).
* `chore`: Maintenance tasks, config files, package dependencies (e.g., `chore(backend): add nodemon dependency`).

---

## 2. Commit Granularity
* **Atomic Commits**: One commit should represent a single logical change. Do not bundle database updates, styling fixes, and routing logic into a single commit.
* **Frequency**: Commit immediately after completing a component's implementation and verifying it with unit tests.

---

## 3. Pull Request Requirements
* Every Pull Request (PR) must contain:
  * A clear summary of modifications.
  * Links to respective issue tickets or tasks.
  * Verified local test pass logs.
* A PR cannot be merged into `main` or `dev` branches without at least one approved peer code review.
