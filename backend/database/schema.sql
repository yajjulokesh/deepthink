-- =============================================================================
-- Student Portal Database Schema (PostgreSQL DDL)
-- Role: Database Engineer
-- Target DBMS: PostgreSQL 14+
-- =============================================================================

-- Drop schema objects if rebuilding (Optional / Migration Reset)
DROP TABLE IF EXISTS "attachments" CASCADE;
DROP TABLE IF EXISTS "reports" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "issue_status_history" CASCADE;
DROP TABLE IF EXISTS "management_responses" CASCADE;
DROP TABLE IF EXISTS "issue_comments" CASCADE;
DROP TABLE IF EXISTS "issue_votes" CASCADE;
DROP TABLE IF EXISTS "student_issues" CASCADE;
DROP TABLE IF EXISTS "announcement_comments" CASCADE;
DROP TABLE IF EXISTS "announcements" CASCADE;
DROP TABLE IF EXISTS "lost_found_comments" CASCADE;
DROP TABLE IF EXISTS "lost_found_posts" CASCADE;
DROP TABLE IF EXISTS "system_settings" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

DROP TYPE IF EXISTS "ReportStatus" CASCADE;
DROP TYPE IF EXISTS "IssueStatus" CASCADE;
DROP TYPE IF EXISTS "IssueCategory" CASCADE;
DROP TYPE IF EXISTS "AnnouncementPriority" CASCADE;
DROP TYPE IF EXISTS "LostFoundStatus" CASCADE;
DROP TYPE IF EXISTS "LostFoundType" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;

-- -----------------------------------------------------------------------------
-- 1. ENUM DEFINITIONS
-- -----------------------------------------------------------------------------

CREATE TYPE "Role" AS ENUM (
  'STUDENT',
  'REPRESENTATIVE',
  'MANAGEMENT',
  'ADMIN'
);

CREATE TYPE "LostFoundType" AS ENUM (
  'LOST',
  'FOUND'
);

CREATE TYPE "LostFoundStatus" AS ENUM (
  'ACTIVE',
  'RESOLVED'
);

CREATE TYPE "AnnouncementPriority" AS ENUM (
  'NORMAL',
  'IMPORTANT',
  'URGENT',
  'OFFICIAL_CLARIFICATION'
);

CREATE TYPE "IssueCategory" AS ENUM (
  'ACADEMIC',
  'HOSTEL',
  'INFRASTRUCTURE',
  'TRANSPORTATION',
  'CANTEEN',
  'FACILITIES',
  'TECHNOLOGY',
  'OTHER'
);

CREATE TYPE "IssueStatus" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'ACKNOWLEDGED',
  'ACTION_PLANNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'DUPLICATE'
);

CREATE TYPE "ReportStatus" AS ENUM (
  'PENDING',
  'REVIEWED',
  'DISMISSED',
  'ACTION_TAKEN'
);

-- -----------------------------------------------------------------------------
-- 2. TABLE DEFINITIONS & CONSTRAINTS
-- -----------------------------------------------------------------------------

-- Users Table
CREATE TABLE "users" (
  "id" VARCHAR(36) PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  "role" "Role" DEFAULT 'STUDENT' NOT NULL,
  "avatarUrl" VARCHAR(500),
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Lost & Found Posts Table
CREATE TABLE "lost_found_posts" (
  "id" VARCHAR(36) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "type" "LostFoundType" NOT NULL,
  "description" TEXT NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "location" VARCHAR(255) NOT NULL,
  "imageUrl" VARCHAR(500),
  "status" "LostFoundStatus" DEFAULT 'ACTIVE' NOT NULL,
  "createdBy" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "resolvedAt" TIMESTAMP WITH TIME ZONE
);

-- Lost & Found Comments Table
CREATE TABLE "lost_found_comments" (
  "id" VARCHAR(36) PRIMARY KEY,
  "postId" VARCHAR(36) NOT NULL REFERENCES "lost_found_posts"("id") ON DELETE CASCADE,
  "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Announcements Table
CREATE TABLE "announcements" (
  "id" VARCHAR(36) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "priority" "AnnouncementPriority" DEFAULT 'NORMAL' NOT NULL,
  "isOfficial" BOOLEAN DEFAULT FALSE NOT NULL,
  "commentsEnabled" BOOLEAN DEFAULT TRUE NOT NULL,
  "createdBy" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "publishedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Announcement Comments Table
CREATE TABLE "announcement_comments" (
  "id" VARCHAR(36) PRIMARY KEY,
  "announcementId" VARCHAR(36) NOT NULL REFERENCES "announcements"("id") ON DELETE CASCADE,
  "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Student Issues Table
CREATE TABLE "student_issues" (
  "id" VARCHAR(36) PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "category" "IssueCategory" NOT NULL,
  "location" VARCHAR(255),
  "createdBy" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "status" "IssueStatus" DEFAULT 'SUBMITTED' NOT NULL,
  "upvoteCount" INT DEFAULT 0 NOT NULL,
  "threshold" INT DEFAULT 100 NOT NULL,
  "thresholdReachedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "resolvedAt" TIMESTAMP WITH TIME ZONE
);

-- Issue Votes Table (CRITICAL CONSTRAINT: Unique vote per user per issue)
CREATE TABLE "issue_votes" (
  "id" VARCHAR(36) PRIMARY KEY,
  "issueId" VARCHAR(36) NOT NULL REFERENCES "student_issues"("id") ON DELETE CASCADE,
  "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT "unique_issue_user_vote" UNIQUE ("issueId", "userId")
);

-- Issue Comments Table
CREATE TABLE "issue_comments" (
  "id" VARCHAR(36) PRIMARY KEY,
  "issueId" VARCHAR(36) NOT NULL REFERENCES "student_issues"("id") ON DELETE CASCADE,
  "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Management Responses Table
CREATE TABLE "management_responses" (
  "id" VARCHAR(36) PRIMARY KEY,
  "issueId" VARCHAR(36) NOT NULL REFERENCES "student_issues"("id") ON DELETE CASCADE,
  "managementUserId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Issue Status History Table
CREATE TABLE "issue_status_history" (
  "id" VARCHAR(36) PRIMARY KEY,
  "issueId" VARCHAR(36) NOT NULL REFERENCES "student_issues"("id") ON DELETE CASCADE,
  "oldStatus" "IssueStatus" NOT NULL,
  "newStatus" "IssueStatus" NOT NULL,
  "changedBy" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "reason" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Notifications Table
CREATE TABLE "notifications" (
  "id" VARCHAR(36) PRIMARY KEY,
  "userId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" VARCHAR(100) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "referenceType" VARCHAR(50),
  "referenceId" VARCHAR(36),
  "isRead" BOOLEAN DEFAULT FALSE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "readAt" TIMESTAMP WITH TIME ZONE
);

-- Reports Table
CREATE TABLE "reports" (
  "id" VARCHAR(36) PRIMARY KEY,
  "reportedBy" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "targetType" VARCHAR(50) NOT NULL,
  "targetId" VARCHAR(36) NOT NULL,
  "reason" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "status" "ReportStatus" DEFAULT 'PENDING' NOT NULL,
  "reviewedBy" VARCHAR(36) REFERENCES "users"("id") ON DELETE SET NULL,
  "reviewedAt" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Attachments Table
CREATE TABLE "attachments" (
  "id" VARCHAR(36) PRIMARY KEY,
  "fileName" VARCHAR(255) NOT NULL,
  "fileUrl" VARCHAR(500) NOT NULL,
  "fileType" VARCHAR(100) NOT NULL,
  "fileSize" INT NOT NULL,
  "uploadedBy" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
  "entityType" VARCHAR(50) NOT NULL,
  "entityId" VARCHAR(36) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- System Settings Table
CREATE TABLE "system_settings" (
  "id" VARCHAR(36) PRIMARY KEY,
  "key" VARCHAR(255) UNIQUE NOT NULL,
  "value" TEXT NOT NULL,
  "description" TEXT,
  "updatedBy" VARCHAR(36) REFERENCES "users"("id") ON DELETE SET NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- -----------------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- -----------------------------------------------------------------------------

CREATE INDEX "idx_users_email" ON "users"("email");
CREATE INDEX "idx_users_role" ON "users"("role");

CREATE INDEX "idx_lost_found_status" ON "lost_found_posts"("status");
CREATE INDEX "idx_lost_found_category" ON "lost_found_posts"("category");
CREATE INDEX "idx_lost_found_createdAt" ON "lost_found_posts"("createdAt");

CREATE INDEX "idx_announcements_priority" ON "announcements"("priority");
CREATE INDEX "idx_announcements_createdAt" ON "announcements"("createdAt");

CREATE INDEX "idx_issues_status" ON "student_issues"("status");
CREATE INDEX "idx_issues_category" ON "student_issues"("category");
CREATE INDEX "idx_issues_upvoteCount" ON "student_issues"("upvoteCount");
CREATE INDEX "idx_issues_createdAt" ON "student_issues"("createdAt");

CREATE INDEX "idx_notifications_user_unread" ON "notifications"("userId", "isRead");
CREATE INDEX "idx_notifications_createdAt" ON "notifications"("createdAt");

CREATE INDEX "idx_reports_status" ON "reports"("status");
