# ⚡ TaskFlow — Team Project & Task Management Application

[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000.svg?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/API-tRPC%20v11-2563EB.svg?style=flat-square&logo=trpc)](https://trpc.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.9-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-000000.svg?style=flat-square&logo=turborepo)](https://turbo.build/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

A production-grade, full-stack **Team Project & Task Management Application** engineered with **MongoDB Atlas**, **Next.js 16 (App Router)**, **tRPC**, **Express (OpenAPI/Scalar)**, and **shadcn/ui**. Features role-based access control (Admin vs Team Member), interactive Kanban and table views, real-time progress metrics, and a dedicated **Deadline Revision Audit Trail** with timeline visualization.

---

## 🔗 Repository & Deployment Links

- **GitHub Repository**: [https://github.com/HimanshuTamoli24/fullstack-assignment](https://github.com/HimanshuTamoli24/fullstack-assignment)
- **Interactive OpenAPI Reference**: `http://localhost:8000/docs` (Scalar API Reference UI)

---

## 📸 Application Previews & Core Features

### 1. 📊 Executive Dashboard & Progress Analytics

The central hub for tracking high-level workspace health, completion rates, active project milestones, overdue deliverables, and a live audit activity stream.

![Dashboard Overview](docs/images/dashboard_overview.jpg)

**Key Capabilities:**

- **Metric Cards**: Real-time counters for Active Projects, Total Tasks, My Assigned Tasks, Completion Rate %, and Overdue Deliverables.
- **Active Project Progress**: Visual completion percentage bars with status distribution counters (`Done`, `In Progress`, `In Review`, `To Do`).
- **Live Audit Activity Stream**: Real-time chronological audit trail of all actions performed across the organization.
- **1-Click Persona Switcher**: Seamlessly switch between Admin and Team Member evaluation accounts directly from the top banner.

---

### 2. 📋 Interactive Kanban Workflow Board

A dynamic board enabling team members and administrators to visualize task stages, priorities, and deadlines at a glance.

![Kanban Board](docs/images/kanban_board.jpg)

**Key Capabilities:**

- **4 Stage Workflow**: `To Do`, `In Progress`, `In Review`, and `Completed`.
- **Informative Task Cards**: Displays colored project tags, priority pills (`🚨 Urgent`, `⚡ High`, `🔹 Med`, `☕ Low`), assignee avatars, deadline date badges, and **Deadline Revision Pill Indicators** (e.g. `⏱️ 2 revisions`).
- **Quick Status Advancement**: 1-click button to advance tasks through workflow stages.
- **Direct Modal Trigger**: Click any card to inspect full specifications, comments, and deadline history.

---

### 3. ⭐ The Additional Challenge: Task Deadline Revision History Timeline

When a project deadline is modified by an administrator, the platform permanently preserves an immutable audit snapshot with previous date, new date, user attribution, timestamp, and reasoning.

![Deadline Revision History Modal](docs/images/deadline_history_modal.jpg)

**Key Capabilities:**

- **Audit Revision Storage**: Embedded MongoDB history array storing `{ previousDeadline, newDeadline, changedBy, changedByName, changedAt, reason }`.
- **Interactive Timeline Visualization**: Renders chronological milestone nodes showing previous date ➔ updated date transition.
- **Modification Reasoning**: Explicit reason callout box (e.g., _"Scope extension requested by client"_).
- **Differential Tagging**: Automatic calculation of adjustment duration (e.g., `+4 Days Extension` or `Accelerated by 2 Days`).
- **Audit Activity Log**: Automatically triggers a `DEADLINE_CHANGED` entry in the workspace activity feed.

---

### 4. 🗂️ Project Initiatives & Team Management

High-level management of company initiatives, deliverable deadlines, and team workload allocation.

![Projects View](docs/images/projects_view.jpg)

**Key Capabilities:**

- **Project Initiative Cards**: Color-coded project cards with completion progress percentages, milestone delivery dates, and description goals.
- **Team Allocation**: Add, remove, and assign team members to specific projects.
- **Quick Filter & Creation**: Filter task board by clicking any project initiative, or quickly add new deliverables directly from the card.

---

## 🎯 Role-Based Features Breakdown

### 👑 Admin Features

- **Create & Manage Projects**: Specify project name, description, brand color, start date, and target delivery milestone.
- **Team Allocation**: Add and assign workspace team members to specific projects.
- **Create & Assign Tasks**: Define task titles, rich descriptions, assignees, priorities (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), initial deadlines, estimated hours, and tags.
- **Set Priorities & Reassign**: Change priorities and task owners on demand.
- **View Project Progress**: Interactive project completion rate charts, progress bars, and status distribution counters.
- **Task Deletion & Management**: Complete administrative control over workspace deliverables.

### 👤 Team Member Features

- **View Assigned Deliverables**: Dedicated "My Assigned Tasks" filter and card badges.
- **Update Task Status**: Advance tasks through workflow stages: `TODO` ➔ `IN_PROGRESS` ➔ `IN_REVIEW` ➔ `COMPLETED`.
- **Post Progress Updates & Comments**: Real-time collaborative discussion thread on tasks.
- **Inspect Deadlines & Priorities**: Immediate visibility into upcoming due dates with overdue warnings.

---

## 👥 Pre-Seeded Test Accounts

You can log in manually or use the **1-Click Persona Switcher** in the top navigation bar:

| Name              | Role     | Email                       | Password     | Job Title / Department                 |
| :---------------- | :------- | :-------------------------- | :----------- | :------------------------------------- |
| **Alex Rivera**   | `ADMIN`  | `alex.admin@taskflow.dev`   | `Admin@123`  | Lead Engineering Manager (Engineering) |
| **Sarah Chen**    | `MEMBER` | `sarah.chen@taskflow.dev`   | `Member@123` | Senior Frontend Engineer (Engineering) |
| **Marcus Vance**  | `MEMBER` | `marcus.vance@taskflow.dev` | `Member@123` | Cloud Architect (Infrastructure)       |
| **Elena Rostova** | `MEMBER` | `elena.design@taskflow.dev` | `Member@123` | Lead Product Designer (Design)         |

---

## 🏗️ System Architecture

```mermaid
graph TD
    %% User Interfaces
    Admin[👑 Admin User] -->|Manages Projects, Assigns Tasks, Updates Deadlines| WebApp[Next.js App /apps/web]
    Member[👤 Team Member] -->|Views Tasks, Advances Status, Adds Comments| WebApp

    %% Frontend to Backend
    WebApp -->|End-to-End Type-Safe tRPC Calls & JWT Auth| APILayer[tRPC Express Gateway /apps/api]
    WebApp -->|UI Design Tokens| UIPackage[packages/ui shadcn primitives]

    %% API Layer
    subgraph BackendGateway [Backend API Layer]
        APILayer --> AuthRouter[Auth Router]
        APILayer --> ProjectRouter[Project Router]
        APILayer --> TaskRouter[Task Router]
        APILayer --> CommentRouter[Comment Router]
        APILayer --> ActivityRouter[Activity Router]
        APILayer --> OpenAPIDocs[Scalar OpenAPI Docs /docs]
    end

    %% Services & Business Logic
    AuthRouter --> UserService[packages/services UserService]
    ProjectRouter --> ProjectService[packages/services ProjectService]
    TaskRouter --> TaskService[packages/services TaskService]
    CommentRouter --> CommentService[packages/services CommentService]
    ActivityRouter --> ActivityService[packages/services ActivityService]

    %% Database Connection
    subgraph DatabaseLayer [Database Layer - MongoDB Atlas]
        UserService --> MongoDB[(MongoDB Atlas Cluster)]
        ProjectService --> MongoDB
        TaskService --> MongoDB
        CommentService --> MongoDB
        ActivityService --> MongoDB
    end
```

---

## 🗄️ Database Schema & Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    TaskFlowUser ||--o{ TaskFlowProject : "owns / participates"
    TaskFlowUser ||--o{ TaskFlowTask : "assigned to / creates"
    TaskFlowUser ||--o{ TaskFlowComment : "authors"
    TaskFlowUser ||--o{ TaskFlowActivity : "performs"

    TaskFlowProject ||--o{ TaskFlowTask : "contains"
    TaskFlowProject ||--o{ TaskFlowActivity : "tracks"

    TaskFlowTask ||--o{ TaskFlowComment : "has"
    TaskFlowTask ||--o{ TaskFlowActivity : "logs"
    TaskFlowTask ||--o{ DeadlineHistory : "embeds revision snapshots"

    TaskFlowUser {
        ObjectId _id PK
        string fullName
        string email UK
        string password
        string salt
        string role "ADMIN | MEMBER"
        string avatarUrl
        string jobTitle
        string department
        date createdAt
        date updatedAt
    }

    TaskFlowProject {
        ObjectId _id PK
        string name
        string description
        string color
        string status "PLANNING | ACTIVE | ON_HOLD | COMPLETED"
        ObjectId ownerId FK
        ObjectId[] memberIds FK
        date startDate
        date targetEndDate
        date createdAt
        date updatedAt
    }

    TaskFlowTask {
        ObjectId _id PK
        string title
        string description
        ObjectId projectId FK
        ObjectId assigneeId FK
        ObjectId creatorId FK
        string priority "LOW | MEDIUM | HIGH | URGENT"
        string status "TODO | IN_PROGRESS | IN_REVIEW | COMPLETED"
        date deadline
        DeadlineHistory[] deadlineHistory "Embedded Array"
        number estimatedHours
        string[] tags
        date createdAt
        date updatedAt
    }

    DeadlineHistory {
        date previousDeadline
        date newDeadline
        ObjectId changedBy FK
        string changedByName
        date changedAt
        string reason
    }

    TaskFlowComment {
        ObjectId _id PK
        ObjectId taskId FK
        ObjectId authorId FK
        string content
        date createdAt
        date updatedAt
    }

    TaskFlowActivity {
        ObjectId _id PK
        ObjectId taskId FK
        ObjectId projectId FK
        ObjectId userId FK
        string userName
        string type "TASK_CREATED | STATUS_CHANGED | DEADLINE_CHANGED | ..."
        string details
        object metadata
        date createdAt
    }
```

---

## 📡 API Documentation & tRPC Procedures Catalog

All procedures support tRPC client calls and REST / OpenAPI endpoints:

| Procedure / Route     | Method                              | Access Role   | Description                                                                          |
| :-------------------- | :---------------------------------- | :------------ | :----------------------------------------------------------------------------------- |
| `auth.register`       | `POST /api/auth/register`           | Public        | Register new Admin or Member account with JWT session.                               |
| `auth.login`          | `POST /api/auth/login`              | Public        | Authenticate user credentials and return auth token.                                 |
| `auth.quickDemoLogin` | `POST /api/auth/quick-demo-login`   | Public        | 1-click test login as any seeded persona.                                            |
| `auth.getMe`          | `GET /api/auth/me`                  | Authenticated | Retrieve current session profile and role.                                           |
| `auth.getDemoUsers`   | `GET /api/auth/demo-users`          | Public        | List seeded demo users for instant persona switching.                                |
| `user.list`           | `GET /api/users`                    | Authenticated | List all workspace team members and profiles.                                        |
| `project.list`        | `GET /api/projects`                 | Authenticated | List projects with aggregated progress and task metrics.                             |
| `project.getById`     | `GET /api/projects/:id`             | Authenticated | Get project details, members, and task deliverable breakdown.                        |
| `project.create`      | `POST /api/projects`                | **👑 Admin**  | Create a project with color, members, and target milestone.                          |
| `project.addMember`   | `POST /api/projects/:id/members`    | **👑 Admin**  | Add team member to an existing project.                                              |
| `task.list`           | `GET /api/tasks`                    | Authenticated | List tasks with filters (`projectId`, `assigneeId`, `status`, `priority`, `search`). |
| `task.getById`        | `GET /api/tasks/:id`                | Authenticated | Retrieve task with comments, activity audit, and **deadline revision history**.      |
| `task.create`         | `POST /api/tasks`                   | **👑 Admin**  | Create new task, assign team member, priority, and deadline.                         |
| `task.updateStatus`   | `PATCH /api/tasks/:taskId/status`   | Authenticated | Advance status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`).                    |
| `task.updateDeadline` | `PATCH /api/tasks/:taskId/deadline` | **👑 Admin**  | **Challenge Feature**: Revise deadline & record history snapshot with reason.        |
| `task.updateDetails`  | `PATCH /api/tasks/:taskId/details`  | **👑 Admin**  | Update title, description, priority, assignee, tags.                                 |
| `task.delete`         | `DELETE /api/tasks/:taskId`         | **👑 Admin**  | Remove task and its related comments and logs.                                       |
| `comment.create`      | `POST /api/comments`                | Authenticated | Post comment or progress update to a task.                                           |
| `comment.listByTask`  | `GET /api/comments/task/:taskId`    | Authenticated | Retrieve discussion thread for a task.                                               |
| `activity.listRecent` | `GET /api/activities/recent`        | Authenticated | Get workspace-wide recent audit activity log.                                        |

---

## 🚀 Installation & Local Setup

### 1. Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0 (`npm install -g pnpm`)
- **MongoDB Atlas** connection string (configured in `.env`)

### 2. Clone the Repository

```bash
git clone https://github.com/HimanshuTamoli24/fullstack-assignment.git
cd fullstack-assignment
```

### 3. Environment Variables

Verify `.env` in the root directory contains your MongoDB URI:

```env
MONGODB_URI=mongodb://arnav:wJB6s7rds7yIPKVh@ac-1nysf1w-shard-00-00.ajggrve.mongodb.net:27017,ac-1nysf1w-shard-00-01.ajggrve.mongodb.net:27017,ac-1nysf1w-shard-00-02.ajggrve.mongodb.net:27017/?ssl=true&replicaSet=atlas-5wa56h-shard-0&authSource=admin&appName=Cluster0
PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000
JWT_SECRET=taskflow-super-secret-jwt-key-2026
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Seed the Database

Populate MongoDB Atlas with users, projects, tasks, deadline revision history, and comments:

```bash
pnpm --filter @repo/database seed
```

### 6. Run the Development Server

Start both Next.js frontend (Port `3000`) and Express tRPC API server (Port `8000`):

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verification & Typechecking

```bash
# Run TypeScript validation across all 11 workspace packages
pnpm check-types

# Build production bundles
pnpm build
```

---

## 📂 Project Structure

```
├── apps/
│   ├── api/                    # Express + tRPC + Scalar OpenAPI Docs server
│   │   └── src/
│   │       ├── index.ts        # HTTP bootstrap & MongoDB connection
│   │       └── server.ts       # tRPC & OpenAPI middleware configuration
│   └── web/                    # Next.js 16 App Router application
│       ├── app/                # Root layout, global Tailwind styles & home page
│       ├── components/         # KanbanBoard, TaskDetailModal, TaskList, Nav, etc.
│       ├── context/            # AuthContext & Demo Persona manager
│       └── trpc/               # React Query & tRPC client bindings
├── docs/
│   └── images/                 # Preview screenshots (Dashboard, Kanban, Deadlines, Projects)
├── packages/
│   ├── database/               # Mongoose models (User, Project, Task, Comment, Activity) & seed script
│   ├── env/                    # Type-safe environment validation with Zod
│   ├── services/               # Modular business logic layer (User, Project, Task, Comment, Activity)
│   ├── trpc/                   # Routers, procedures, JWT auth middleware & OpenAPI paths
│   └── ui/                     # Shared UI component library (shadcn/ui primitives)
├── docker-compose.yml          # Container configuration
├── turbo.json                  # Turborepo task pipeline orchestration
└── README.md                   # Complete documentation
```

---

## 🛡️ Security & Best Practices

- **Role-Based Middlewares**: Protected with `adminProcedure` and `protectedProcedure` in tRPC.
- **Password Security**: Salted SHA-256 password hashing with crypto random bytes.
- **JWT Authorization**: Bearer token authentication with 7-day expiration.
- **Audit Logging**: Every status transition and deadline modification is logged with user attribution and timestamp.
