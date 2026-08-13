# Student Portal Backend Implementation Plan

This document outlines the proposed architecture, technology stack, and implementation details for the Student Portal Backend. 

## Goal Description
Develop a clean, secure, and maintainable backend API for a college student portal that supports multiple user roles (STUDENT, REPRESENTATIVE, MANAGEMENT, ADMIN), robust authentication, core features like Lost & Found, Announcements, and Student Issues, as well as a centralized notification system. The backend will strictly enforce business logic and role-based access control independently of the frontend.

> [!CAUTION]
> ## User Review Required
> Please review the technology stack and architecture decisions below. Specifically, confirm if the proposed database tooling (Prisma ORM with PostgreSQL) aligns with the database team's requirements.

> [!IMPORTANT]
> ## Open Questions
> 1. **Technology Stack:** I propose using **Node.js with Express and TypeScript** for the backend. Does this stack align with your expectations, or do you prefer another framework/language (e.g., Python/FastAPI, Go, or NestJS)?
> 2. **Database System:** What specific relational database is the database team using (e.g., PostgreSQL, MySQL)? 
> 3. **ORM/Query Builder:** Is the database team providing a strictly defined schema that we should introspect, or can we manage the schema using an ORM like **Prisma** or **TypeORM**? (If they provide raw SQL schemas, we can use a query builder like Knex or raw queries).
> 4. **File Uploads:** Where should uploaded files be stored? Should we use local storage, or a cloud provider like AWS S3?
> 5. **Token Expiry:** Do you have preferred expiration times for access and refresh tokens?

## Proposed Architecture & Technology Stack

- **Runtime & Framework:** Node.js + Express.js
- **Language:** TypeScript (for type safety and cleaner contracts)
- **Database Access:** Prisma ORM (or TypeORM/Knex depending on your answer to the open questions)
- **Authentication:** JSON Web Tokens (JWT) for stateless session management, bcrypt for password hashing.
- **Validation:** Zod (for validating request bodies, query params, and route params).
- **Testing:** Jest + Supertest for integration and unit testing.

## Proposed Project Structure

```text
src/
├── config/           # Environment variables and configuration (e.g., issue vote thresholds)
├── controllers/      # Route handlers (Auth, Issues, Announcements, etc.)
├── middlewares/      # Auth, Role guards, Error handling, Validation
├── services/         # Core business logic (Threshold logic, vote deduplication)
├── routes/           # API versioning and route definitions (e.g., /api/v1/...)
├── utils/            # Helpers (token generation, file upload logic)
├── types/            # TypeScript interfaces/types
└── prisma/           # Database schema and migrations (if applicable)
```

## Core Implementation Details

### 1. Authentication & Authorization
- Implement `/api/v1/auth/login`, `/api/v1/auth/register`, etc.
- Create middlewares: `authenticateToken`, `requireRole(roles[])`.
- Passwords will be securely hashed with bcrypt. 
- The token payload will contain `userId` and `role`, but we will always re-verify permissions for critical actions.

### 2. Upvote & Threshold System (Concurrency Control)
- **Race Conditions:** We will use database transactions to handle issue upvotes. When a vote is cast:
  1. Begin transaction.
  2. Check if the user already voted (if yes, abort).
  3. Insert the vote.
  4. Increment the issue's `currentVotes`.
  5. If `currentVotes == threshold`, mark a `thresholdReached` flag in the issue and trigger the `ISSUE_THRESHOLD_REACHED` notification.
  6. Commit transaction.
- This ensures the notification fires exactly once, even if multiple students vote at the exact same millisecond.

### 3. API Design
Routes will follow RESTful principles with versioning, exactly as requested:
- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/lost-found`
- `/api/v1/announcements`
- `/api/v1/issues`
- `/api/v1/notifications`
- `/api/v1/admin`

All API responses will follow the standardized format:
```json
{
  "success": true,
  "data": { ... }
}
```
Or for errors:
```json
{
  "success": false,
  "error": { "code": "...", "message": "..." }
}
```

## Verification Plan

### Automated Tests
- Unit tests for authentication utilities and threshold logic.
- Integration tests using Supertest to verify:
  - Role-based access control (e.g., STUDENT cannot create announcements).
  - The 100th vote triggers a notification, and the 101st vote does not.
  - CRUD operations for Lost & Found, Announcements, and Issues.
  - Validation middleware correctly rejects bad payloads.

### Manual Verification
- Testing the API using Postman or Swagger UI.
- Demonstrating the API boundaries, error handling, and threshold behaviors to the frontend and management teams.
