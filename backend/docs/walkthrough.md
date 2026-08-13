# Student Portal Backend Walkthrough

I have successfully scaffolded the foundational backend architecture for the Student Portal and implemented the most critical business logic requirements. 

Here is a summary of what was accomplished and how it functions.

## 1. Project Scaffolding & Architecture
- **Tech Stack Setup:** Initialized a Node.js project with Express and TypeScript.
- **Project Structure:** Created a scalable structure (`src/controllers`, `src/routes`, `src/middlewares`, `src/services`, `src/utils`).
- **Standardized Responses:** Implemented a unified JSON response format (`sendSuccess` and `sendError` in `src/utils/response.ts`) to ensure the frontend always receives predictable payloads.

## 2. Database Integration
- **Prisma ORM:** Set up Prisma as the database abstraction layer to strictly interface with the schema defined by the database team.
- **Schema Constraints:** Designed the Prisma schema (`prisma/schema.prisma`) featuring all the requested core entities (`users`, `student_issues`, `issue_votes`, etc.). 
- **Integrity:** Enforced a database-level unique constraint (`@@unique([issue_id, user_id])`) on `issue_votes` to guarantee that a student can only vote once per issue, preventing duplicates at the database level.

## 3. Security & Access Control
- **Authentication:** Created robust token generation and verification logic (`src/utils/jwt.ts`) using `jsonwebtoken`.
- **Role-Based Guards:** Implemented strict authorization middlewares (`src/middlewares/auth.middleware.ts`):
  - `requireAuth`: Verifies the token and injects the user payload into the request.
  - `requireRole`: Independent backend verification that prevents users from accessing unauthorized routes, trusting only the signed JWT, *not* the frontend.

## 4. Student Issues & Threshold Logic (Critical Requirement)

The most complex requirement was ensuring that the 100-vote threshold notification fires exactly once, without race conditions or duplicate events.

- **Interactive Transactions:** The upvoting logic (`src/services/issue.service.ts`) is wrapped in a Prisma `$transaction`.
- **Race-Condition-Proofing:** 
  1. The vote count is incremented atomically.
  2. If the count reaches the configured threshold (e.g., 100), the system uses an atomic check-and-set query (`updateMany` where `threshold_reached: false`) to flip the flag.
  3. If two users vote at the exact same millisecond resulting in counts 100 and 101, only the transaction that successfully flips the flag to `true` will trigger the Management notification.

## 5. Automated Verification
I created a Jest test suite (`src/services/issue.service.test.ts`) that programmatically verifies the threshold logic:

> [!TIP]
> **Test Results: PASS**
> - `should trigger notification on exactly the 100th vote`
> - `should NOT trigger notification on the 101st vote`
> - `should prevent race conditions on exactly 100 votes concurrently`

## Next Steps
The core architectural foundation is complete. The remaining work involves fleshing out the basic CRUD controllers for `Lost & Found`, `Announcements`, and `Admin` APIs following the established patterns, and integrating file upload logic.

All code is cleanly separated, ensuring the backend independently enforces all business rules!
