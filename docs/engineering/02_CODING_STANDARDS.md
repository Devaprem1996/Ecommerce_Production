# 02_CODING_STANDARDS.md

# Engineering Coding Standards

Version: 1.0

Status: Approved

---

## 1. Language & Type Safety
* **TypeScript Strict Mode**: The compiler flag `"strict": true` must be enabled.
* **No implicit `any`**: Explicit type declarations or interfaces are required for all structures. Use `unknown` or custom generics if types are dynamic.
* **Optional Chaining & Nullish Coalescing**: Always prefer `data?.property` and `value ?? fallback` over broad truthiness checks (`data && data.property`).

---

## 2. Formatting & Styles
* **Formatter**: Enforce **Prettier** with the following standardized parameters:
  ```json
  {
    "semi": true,
    "singleQuote": false,
    "tabWidth": 2,
    "trailingComma": "all",
    "printWidth": 100
  }
  ```
* **Linter**: Utilize **ESLint** with rules matching `eslint:recommended` and `@typescript-eslint/recommended`.

---

## 3. Function & File Limits
* **Single Responsibility**: Every file contains one class, module, or group of closely coupled operations.
* **Function Length**: Keep functions under **50 lines**. If a function exceeds 50 lines, refactor its internal sub-routines into helper utilities.
* **No Magic Numbers**: Declare constant variables at the top of the file or inside `/constants` folders instead of using hardcoded string values or numerical offsets directly in code.
