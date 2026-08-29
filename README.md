# Base tRPC Monorepo Boilerplate

[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-000000.svg?style=flat-square&logo=turborepo)](https://turbo.build/)
[![tRPC](https://img.shields.io/badge/API-tRPC-2563EB.svg?style=flat-square&logo=trpc)](https://trpc.io/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000.svg?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Drizzle ORM](https://img.shields.io/badge/Database-Drizzle%20ORM-C5F74F.svg?style=flat-square&logo=postgresql)](https://orm.drizzle.team/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

An enterprise-ready, robust starter monorepo implementing end-to-end type safety with tRPC, Next.js, and Express. It uses Turborepo for workspace orchestration, Drizzle ORM for PostgreSQL database modeling, and a highly structured shared library pattern.

---

## 📐 Architecture Overview

The workspace follows a strict division of concerns separating consumer applications, API routers, business services, and database schemas:

```mermaid
graph TD
    %% Clients
    WebClient[Next.js App Client /apps/web] -->|tRPC Client / Promise Proxy| TRPCExpressAdaptor
    WebClient -->|Shared Components| UI[packages/ui UI Primitives]

    %% API Server
    subgraph ExpressServer [Standalone API Layer]
        TRPCExpressAdaptor[apps/api tRPC Adapter Middleware]
        OpenApiRouter[apps/api OpenAPI Middleware]
        DocsRouter[apps/api Docs Router /docs]
    end

    TRPCExpressAdaptor --> ServerRouter[packages/trpc API Router]
    OpenApiRouter --> ServerRouter
    DocsRouter -->|Scalar reference UI| OpenApiRouter

    %% Shared libraries
    subgraph SharedLibraries [Shared packages]
        ServerRouter --> UserService[packages/services UserService]
        UserService --> DBClient[packages/database Drizzle Client]
        DBClient --> Postgres[(PostgreSQL Database)]

        EnvConfig[packages/env Configuration]
        LoggerConfig[packages/logger Winston logger]
        Validators[packages/validators Zod Models]
    end

    ServerRouter -.-> Validators
    ServerRouter -.-> LoggerConfig
    ServerRouter -.-> EnvConfig
    WebClient -.-> EnvConfig
```

---

## 🔄 Request Lifecycle

How a typed call travels from the browser to Postgres and back:

```mermaid
flowchart LR
    A[React Component] --> B[tRPC Client\nPromise Proxy]
    B --> C{Express /trpc\nAdapter}
    C --> D[isAuthenticated\nMiddleware]
    D -->|JWT valid| E[Router Procedure]
    D -->|JWT invalid| X[401 Error\nFormatter]
    E --> F[Zod Input\nValidation]
    F -->|valid| G[UserService]
    F -->|invalid| Y[400 Error\nFormatter]
    G --> H[Drizzle ORM]
    H --> I[(PostgreSQL)]
    I --> H --> G --> E --> C --> B --> A
```

---

## 🔐 Auth Sequence — Sign Up & Login

```mermaid
sequenceDiagram
    actor U as User
    participant W as Next.js Web (apps/web)
    participant T as tRPC Client
    participant API as Express /trpc (apps/api)
    participant AR as auth Router
    participant US as UserService
    participant DB as Drizzle / PostgreSQL

    U->>W: Submit signup form
    W->>T: auth.signUp.mutate(payload)
    T->>API: POST /trpc/auth.signUp
    API->>AR: route to auth procedure
    AR->>AR: validate payload (Zod)
    AR->>US: createUserWithEmailAndPassword()
    US->>US: hash password (HMAC + salt)
    US->>DB: INSERT INTO usersTable
    DB-->>US: new user row
    US-->>AR: user record
    AR->>AR: sign JWT (JWT_SECRET)
    AR-->>API: Set-Cookie: token + user payload
    API-->>T: 200 OK (typed response)
    T-->>W: resolved promise
    W-->>U: redirect to dashboard

    Note over U,DB: Subsequent requests reuse the cookie JWT,<br/>verified by isAuthenticated middleware
```

---

## 🗄️ Database ER Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string fullName
        string email UK
        string profileImageUrl
        string plan
        int credits
        boolean onboardingCompleted
        timestamp createdAt
        timestamp updatedAt
    }
```

> `packages/database/models/user.ts` currently defines a single `usersTable`. As new tables are added (e.g. sessions, teams, invoices), extend this diagram with the corresponding relationships.

---

## 📂 Folder Structure & Package Mapping

```mermaid
graph LR
    Root[monorepo root] --> Apps[apps/]
    Root --> Packages[packages/]

    Apps --> web[web — Next.js 16]
    Apps --> api[api — Express + tRPC]

    Packages --> trpc[trpc — routers/client]
    Packages --> database[database — Drizzle ORM]
    Packages --> services[services — business logic]
    Packages --> env[env — Zod env config]
    Packages --> logger[logger — Winston]
    Packages --> ui[ui — component library]
    Packages --> validators[validators — Zod schemas]
    Packages --> tsconfig[typescript-config]
    Packages --> eslintconfig[eslint-config]
```

### Consumer Applications (`/apps`)

- [**`apps/web`**](file:///c:/dev-work/desktop/github-prod/apps/web): Next.js 16 Web Dashboard using App Router, Tailwind CSS, Lucide icons, and `@repo/ui` primitives. Queries the backend server through a client-side tRPC Promise client.
- [**`apps/api`**](file:///c:/dev-work/desktop/github-prod/apps/api): Standalone Express backend server. Exposes:
  - A `/health` Express status route.
  - A `/trpc` endpoint mapping the shared tRPC router to Express requests.
  - A `/docs` route rendering an interactive API documentation reference via Scalar from generated OpenAPI JSON specifications.

### Shared Workspace Packages (`/packages`)

- [**`packages/trpc`**](file:///c:/dev-work/desktop/github-prod/packages/trpc): Contains client definitions (`client/`) and server router endpoints (`server/`):
  - `health`: Route for testing server status.
  - `auth`: Mutation for creating users and generating JWT tokens.
  - `user`: Queries/Mutations for profile management and account statuses.
  - Custom authorization checking middleware (`isAuthenticated`) verifying cookie JWT headers.
  - Custom error formatter returning user-friendly validation error titles and messages.
- [**`packages/database`**](file:///c:/dev-work/desktop/github-prod/packages/database): Setup for Drizzle ORM client, schemas, and configurations:
  - `models/user.ts`: Defines `usersTable` mapping `id` (UUID), `fullName`, `email`, `profileImageUrl`, `plan`, `credits`, `onboardingCompleted`, and timestamps.
- [**`packages/services`**](file:///c:/dev-work/desktop/github-prod/packages/services): Implements core backend business logic.
  - `UserService`: Methods for `createUserWithEmailAndPassword` (with custom HMAC salt hashing), profile retrieval, updating profile, and fetching plan limits.
- [**`packages/env`**](file:///c:/dev-work/desktop/github-prod/packages/env): Runtime environmental variable parsing using Zod schemas. Validates key credentials (e.g. `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, etc.) before allowing execution.
- [**`packages/logger`**](file:///c:/dev-work/desktop/github-prod/packages/logger): Lightweight Winston-based JSON logging library supporting colored console output during local development.
- [**`packages/ui`**](file:///c:/dev-work/desktop/github-prod/packages/ui): Workspace component library using Tailwind v4. Exports pre-built shadcn-like visual elements (e.g. `Button`, `Input`, `Dialog`).
- [**`packages/validators`**](file:///c:/dev-work/desktop/github-prod/packages/validators): Shared validation definitions for payloads.
- [**`packages/typescript-config`** / **`packages/eslint-config`**](file:///c:/dev-work/desktop/github-prod/packages/typescript-config): Presets for TS compiler checks and lint validation rules.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (Version >= 18.x)
- **PNPM** (Version >= 9.x)
- **PostgreSQL** running instance

### 1. Install Dependencies

Install all workspaces node modules from the root directory:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connections
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/db"

# Google Gemini API (Placeholder)
GEMINI_API_KEY="dummy_gemini_api_key"

# Supabase Auth / SDK Configuration
NEXT_PUBLIC_SUPABASE_URL="https://dummy-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy-anon-key"
SUPABASE_SERVICE_ROLE_KEY="dummy-service-role-key"

# Authentication Configs
BETTER_AUTH_SECRET="dummy-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-signing-secret"
```

### 3. Initialize Database Migrations

Generate schema assets and apply migrations onto the PostgreSQL engine:

```bash
# Generate SQL migration scripts
pnpm run db:generate

# Apply migrations to database engine
pnpm run db:migrate
```

### 4. Run Development Server

```bash
pnpm run dev
```

This command runs the local dev tasks in parallel using Turborepo and loaded environmental configurations via `dotenv-cli`:

- **Next.js Web Panel** runs on `http://localhost:3000`
- **Express Backend Gateway** runs on `http://localhost:8000`

---

## ⚡ Workspace Task Commands

Run project tasks across all workspaces using the root Turborepo runner:

```bash
# Build production bundle for all workspaces
pnpm run build

# Run ESLint validation checks
pnpm run lint

# Format code files using Prettier configuration
pnpm run format

# Run TS type compilation verification
pnpm run check-types
```
