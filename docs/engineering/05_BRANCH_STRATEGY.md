# 05_BRANCH_STRATEGY.md

# Engineering Branch Strategy

Version: 1.0

Status: Approved

---

## 1. Branch Hierarchy

```
       [ main ]       (Production-ready release branch)
          ▲
          │ (Release Merge)
       [ dev ]        (Development integration branch)
        ▲   ▲
        │   └── [ fix/bug-description ]
        │
     [ feat/feature-name ]
```

### A. main
* Enforces production-stable releases.
* Merges to `main` are restricted to tagged versions released from the `dev` branch. Direct commits are blocked.

### B. dev
* The central integration branch.
* All development tasks branch out of `dev` and merge back into `dev` after passing code review and local integration runs.

### C. Feature & Fix Branches
* **Features**: Named as `feat/feature-scope` (e.g., `feat/google-oauth`).
* **Bug Fixes**: Named as `fix/bug-scope` (e.g., `fix/jwt-validation-refresh`).

---

## 2. Integration Pipeline
1. Branch from `dev`.
2. Implement feature tasks + write respective tests.
3. Push to branch and create PR into `dev`.
4. PR triggers peer code review.
5. Merge into `dev` via squash-merge to maintain clean logs.
