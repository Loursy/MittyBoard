# MittyBoard

A Trello-style Kanban board app for organizing work into workspaces, boards, columns, and tasks — with drag-and-drop and live real-time updates across everyone viewing the same board.

**Live demo:** [https://mittyboard.duckdns.org](https://mittyboard.duckdns.org)

## Features

- Workspaces → Boards → Columns → Tasks hierarchy
- Drag-and-drop reordering of columns and tasks
- Real-time board updates over WebSocket (no manual refresh needed when a teammate moves a card)
- JWT-based authentication (register/login), with each user scoped to their own workspaces
- Task priorities, statuses, and due dates

## Tech Stack

### Backend — `backend/`

- **Java 25** on **Spring Boot 4.1**
- **Spring Web MVC** — REST API (`AuthenticationController`, `WorkspaceController`, `BoardController`, `TaskColumnController`, `TaskController`, `UserController`)
- **Spring Security** — stateless auth; a custom `JwtAuthenticationFilter` validates the bearer token on every request instead of using sessions
- **jjwt (io.jsonwebtoken)** — issues and verifies the JWTs (`JwtService`)
- **Spring Data JPA** — persistence layer over the `entity`/`repository` packages (`User`, `Workspace`, `Board`, `TaskColumn`, `Task`)
- **PostgreSQL** — primary datastore (via the `postgresql` JDBC driver)
- **Spring WebSocket + STOMP over SockJS** (`WebSocketConfig`) — broadcasts board changes to every connected client on a `/topic` destination in real time
- **Spring Validation** — request DTO validation (`dto` package)
- **Lombok** — cuts down entity/DTO boilerplate
- **JUnit 5 / Spring Boot Test** — service-layer test suite (`*ServiceTest`)
- **Maven** (with the `mvnw` wrapper) — build tool

### Frontend — `frontend/`

- **React 19** + **TypeScript**
- **Vite** — dev server and production bundler
- **React Router** — client-side routing between workspace/board pages
- **Tailwind CSS 4** (via `@tailwindcss/postcss`) — styling
- **@dnd-kit** (`core`, `sortable`, `utilities`) — drag-and-drop for columns and task cards
- **@stomp/stompjs** + **sockjs-client** — subscribes to the backend's WebSocket topic so board state stays in sync live
- **Axios** — HTTP client for the REST API, wired through `src/api`
- **React Hot Toast** — user-facing notifications
- **Lucide React** — icon set
- **clsx** / **tailwind-merge** — conditional & merged class names
- **ESLint** + **typescript-eslint** — linting

### Infrastructure & Deployment

- **Docker** — both `backend/` and `frontend/` ship with their own `Dockerfile`; the frontend is served through **Nginx** in production (`frontend/nginx.conf`)
- **Docker Compose** (`docker-compose.yml`) — spins up Postgres, the Spring Boot backend, and the Nginx-served frontend together for local/self-hosted runs
- **Terraform**, two deployment targets are provided:
  - `infra-ec2/` — the setup actually powering the live demo above: a single free-tier **AWS EC2** instance running the app via Docker Compose, behind **Nginx** with a **Let's Encrypt** TLS certificate (via certbot) and a free **DuckDNS** subdomain
  - `infra/` — a fuller **AWS ECS (Fargate)** setup behind an **Application Load Balancer**, with **RDS** for Postgres, **ECR** for container images, and GitHub OIDC for keyless CI deploys
- **GitHub Actions** (`.github/workflows/`):
  - `ci.yml` — runs backend tests against a Postgres service container and builds both Docker images on every push/PR to `main`
  - `deploy.yml` — builds and pushes images to ECR and rolls out new ECS task definitions (used with the `infra/` ECS setup)

## Project Structure

```
MittyBoard/
├── backend/          # Spring Boot REST + WebSocket API
├── frontend/          # React + TypeScript SPA
├── infra/             # Terraform: AWS ECS/Fargate + RDS + ALB
├── infra-ec2/          # Terraform: single EC2 instance (free-tier, powers the live demo)
├── docker-compose.yml # Local/self-hosted stack: Postgres + backend + frontend
└── .github/workflows/  # CI (test/build) and CD (ECS deploy)
```

## Running Locally

Requires Docker and Docker Compose.

```bash
cp .env.example .env
# fill in DB_PASSWORD and JWT_SECRET_KEY in .env

docker compose up
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8080](http://localhost:8080)

### Running without Docker

**Backend** (needs a local Postgres instance and Java 25):

```bash
cd backend
./mvnw spring-boot:run
```

**Frontend** (needs Node 22+):

```bash
cd frontend
npm install
npm run dev
```
