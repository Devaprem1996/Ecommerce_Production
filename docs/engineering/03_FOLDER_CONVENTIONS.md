# 03_FOLDER_CONVENTIONS.md

# Engineering Folder Conventions

Version: 1.0

Status: Approved

---

## 1. Backend Structure (Express API)
All server files are organized under `/backend/src`:
* `config/`: Configuration loaders (environment variable parsing, db connectors).
* `routes/`: Express endpoint definitions and endpoint binding.
* `controllers/`: HTTP payload unpacking, validator triggers, and service callers.
* `services/`: Core business workflows and transactional validations.
* `repositories/`: Prisma client queries and DB CRUD tasks.
* `middleware/`: Express hooks (authentication, error loggers, CORS filters).
* `validators/`: Input payload validation triggers using Zod schemas.
* `prisma/`: Prisma schemas (`schema.prisma`) and local DB seed files.
* `utils/`: Reusable stateless computational logic (date formatters, token generators).
* `types/` & `interfaces/`: Typings and generic type files.

---

## 2. Frontend Structure (Next.js App Router)
All client files are organized under `/frontend/src`:
* `app/`: Next.js layouts, error pages, custom loading screens, and pages.
* `components/`: UI assets partitioned into `ui/` (base tags like Button, Modal) and `features/` (feature logic like ProductCard).
* `hooks/`: Reusable custom React hooks (`useAuth`, `useCart`).
* `services/`: API caller classes/methods using fetch or axios instances.
* `store/`: Zustand client-side persistent storage managers.
* `lib/`: Integrations with external client packages (e.g., Lucide React icons, TanStack configuration).
* `types/`: Domain-level typings.
* `utils/`: Base string helpers, calculations, or token decoders.
* `styles/`: Tailwind theme overrides and standard global files.
