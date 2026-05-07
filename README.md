# Group Task Splitter

A full-stack monorepo for managing group projects, tracking task ownership, collecting evidence of work, and supporting lecturer review of individual contributions.

## Description

Group Task Splitter is designed to reduce free-riding in team assignments by combining:

-   project and task management
-   evidence-based contribution tracking
-   inactivity monitoring for inactive members
-   lecturer access for read-only review
-   a modern web UI for day-to-day project work

## Repository Structure

-   `web/` - Frontend application built with React, TanStack Router, Vite, and TanStack Query
-   `server/` - Backend monorepo built with NestJS microservices, Prisma, and MariaDB

## Main Features

### Frontend

-   project dashboard and workflow UI
-   authentication screens
-   project, task, and profile pages
-   responsive interface for students and leaders

### Backend Services

-   Auth Service - registration, login, profile, JWT auth
-   Project Service - projects, tasks, assignments, task status updates
-   Evidence Service - evidence upload and verification
-   Ghost Buster Service - inactivity tracking and flagged-member monitoring

## Tech Stack

### Frontend

-   React 19
-   TanStack Router
-   TanStack Query
-   Vite
-   Tailwind CSS 4
-   Biome

### Backend

-   NestJS
-   Prisma
-   MariaDB / MySQL
-   Passport JWT
-   Swagger/OpenAPI
-   Turborepo
-   Bun

## Requirements

-   Bun 1.1+
-   Docker Desktop
-   Node.js compatible runtime for tooling used by Nest and Prisma
-   MariaDB provided through Docker for local development

## Local Setup

### 1. Clone and install dependencies

From the repository root:

```bash
cd web
bun install

cd ../server
bun install
```

### 2. Start the database

The backend uses Docker MariaDB on host port `3307`.

```bash
cd server
docker compose up -d
```

This creates the databases used by the services:

-   `auth_db`
-   `project_db`
-   `evidence_db`
-   `ghost_db`

### 3. Prepare Prisma for each backend service

The Prisma schemas are already configured per service. Run db push from each service folder if you need to refresh the database schema:

```bash
cd server/app/auth-service && npx prisma db push
cd ../project-service && npx prisma db push
cd ../evidence-service && npx prisma db push
cd ../ghost-buster-service && npx prisma db push
```

### 4. Run the apps

Run the backend services:

```bash
cd server
bun run dev
```

Run the frontend:

```bash
cd web
bun run dev
```

## Development Ports

-   Web app: `http://localhost:3000`
-   Auth Service: `http://localhost:3001`
-   Ghost Buster Service: `http://localhost:3002`
-   Project Service: `http://localhost:3003`
-   Evidence Service: `http://localhost:3004`

## API Documentation

Each backend service exposes Swagger docs on its own port:

-   Auth Service: `/docs`
-   Project Service: `/docs`
-   Evidence Service: `/docs`
-   Ghost Buster Service: `/docs`

Example:

-   `http://localhost:3001/docs`
-   `http://localhost:3003/docs`

## Useful Scripts

### Web

```bash
cd web
bun run dev
bun run build
bun run test
bun run lint
bun run check
bun run format
```

### Server

```bash
cd server
bun run dev
bun run build
bun run test
bun run lint
bun run format
bun run test:e2e
```

## Environment Notes

-   Backend services use a local `.env` file in each service folder.
-   The default database connection points to `localhost:3307`.
-   JWT auth uses `JWT_SECRET` if you set it, otherwise it falls back to the local default used by the services.

## Project Status

This project is currently in MVP state.

-   core auth flow works
-   project/task management is wired
-   evidence submission and review are wired
-   ghost buster monitoring is implemented as a simple MVP
-   frontend and backend can be run independently

## Troubleshooting

-   If Docker complains about port `3306`, this repo already uses `3307` for local development.
-   If Prisma says `DATABASE_URL` is missing, make sure you run the command from the correct service directory.
-   If a service cannot connect to the database, confirm Docker Desktop is running and `docker compose up -d` succeeded in `server/`.
