-- =============================================================================
-- Student Portal Database Seed Data Script
-- Target DBMS: PostgreSQL 14+
-- =============================================================================

-- 1. Insert Initial System Settings
INSERT INTO "system_settings" ("id", "key", "value", "description") VALUES
  ('setting_1', 'student_issue_upvote_threshold', '100', 'Threshold of votes required to alert management team automatically');

-- 2. Insert Users for all 4 roles
-- Passwords below are hashed representations of 'Password123!' using bcrypt
INSERT INTO "users" ("id", "name", "email", "passwordHash", "role", "avatarUrl") VALUES
  ('usr_admin_1', 'System Administrator', 'admin@college.edu', '$2b$10$wT5H5PzE.S4e.5gYq.QZ2u0x1G2y3z4a5b6c7d8e9f0g1h2i3j4k5', 'ADMIN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'),
  ('usr_mgmt_1', 'Dean of Student Affairs', 'dean@college.edu', '$2b$10$wT5H5PzE.S4e.5gYq.QZ2u0x1G2y3z4a5b6c7d8e9f0g1h2i3j4k5', 'MANAGEMENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dean'),
  ('usr_rep_1', 'Sarah Jenkins (Hostel Rep)', 'sarah.rep@student.college.edu', '$2b$10$wT5H5PzE.S4e.5gYq.QZ2u0x1G2y3z4a5b6c7d8e9f0g1h2i3j4k5', 'REPRESENTATIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
  ('usr_student_1', 'John Doe', 'john.doe@student.college.edu', '$2b$10$wT5H5PzE.S4e.5gYq.QZ2u0x1G2y3z4a5b6c7d8e9f0g1h2i3j4k5', 'STUDENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
  ('usr_student_2', 'Alex Rivera', 'alex.rivera@student.college.edu', '$2b$10$wT5H5PzE.S4e.5gYq.QZ2u0x1G2y3z4a5b6c7d8e9f0g1h2i3j4k5', 'STUDENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex');

-- 3. Insert Lost & Found Posts & Comments
INSERT INTO "lost_found_posts" ("id", "title", "type", "description", "category", "location", "imageUrl", "status", "createdBy") VALUES
  ('lf_1', 'Lost iPhone 14 Pro', 'LOST', 'Black iPhone 14 Pro in a clear case with a sticker on the back.', 'Electronics', 'Library 2nd Floor', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', 'ACTIVE', 'usr_student_1'),
  ('lf_2', 'Found College ID Card', 'FOUND', 'Found ID card belonging to Computer Science department student.', 'Cards/IDs', 'Main Canteen Counter', 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2', 'ACTIVE', 'usr_student_2'),
  ('lf_3', 'Lost Wireless Earbuds', 'LOST', 'Pair of black Sony wireless earbuds left in Room 304.', 'Electronics', 'Academic Block B', NULL, 'RESOLVED', 'usr_rep_1');

INSERT INTO "lost_found_comments" ("id", "postId", "userId", "content") VALUES
  ('lfc_1', 'lf_1', 'usr_student_2', 'I think I saw someone turn a phone in at the library help desk around 2 PM!'),
  ('lfc_2', 'lf_2', 'usr_student_1', 'Thanks for posting! Handed it over to security office.');

-- 4. Insert Official Announcements
INSERT INTO "announcements" ("id", "title", "content", "category", "priority", "isOfficial", "commentsEnabled", "createdBy", "publishedAt") VALUES
  ('anc_1', 'End Semester Examination Schedule Released', 'The draft schedule for the upcoming end-semester examinations is now published on the portal.', 'Academics', 'IMPORTANT', true, true, 'usr_mgmt_1', CURRENT_TIMESTAMP),
  ('anc_2', 'Campus Closed for National Holiday', 'Please note that the campus facilities and administrative offices will remain closed this Friday.', 'General', 'NORMAL', true, false, 'usr_mgmt_1', CURRENT_TIMESTAMP),
  ('anc_3', 'URGENT: Water Supply Maintenance Notice', 'Emergency water pipeline repairs in Hostel Block B will take place tonight from 10 PM to 2 AM.', 'Hostel', 'URGENT', true, true, 'usr_mgmt_1', CURRENT_TIMESTAMP);

-- 5. Insert Student Issues & Votes
INSERT INTO "student_issues" ("id", "title", "description", "category", "location", "createdBy", "status", "upvoteCount", "threshold") VALUES
  ('iss_1', 'Frequent Water Cooler Outages in Hostel Block B', 'The drinking water filtration units on floors 2 and 3 have been malfunctioning for a week.', 'HOSTEL', 'Hostel Block B', 'usr_rep_1', 'IN_PROGRESS', 99, 100),
  ('iss_2', 'Insufficient Seating in Main Canteen', 'During peak lunch hours (12-2 PM), students struggle to find seating due to overcrowding.', 'CANTEEN', 'Main Canteen', 'usr_rep_1', 'SUBMITTED', 45, 100),
  ('iss_3', 'Broken Projector in Lecture Hall 102', 'The HDMI connection is flickering and the bulb brightness is degraded.', 'INFRASTRUCTURE', 'Lecture Hall 102', 'usr_student_1', 'ACKNOWLEDGED', 12, 100);

INSERT INTO "issue_votes" ("id", "issueId", "userId") VALUES
  ('iv_1', 'iss_1', 'usr_student_1'),
  ('iv_2', 'iss_1', 'usr_student_2'),
  ('iv_3', 'iss_2', 'usr_student_1');

-- 6. Insert Management Response & Status History
INSERT INTO "management_responses" ("id", "issueId", "managementUserId", "content") VALUES
  ('mr_1', 'iss_1', 'usr_mgmt_1', 'We have dispatched maintenance technicians to inspect and repair the water coolers in Block B by Friday morning.');

INSERT INTO "issue_status_history" ("id", "issueId", "oldStatus", "newStatus", "changedBy", "reason") VALUES
  ('ish_1', 'iss_1', 'SUBMITTED', 'UNDER_REVIEW', 'usr_mgmt_1', 'Initial review completed by hostel administration.'),
  ('ish_2', 'iss_1', 'UNDER_REVIEW', 'IN_PROGRESS', 'usr_mgmt_1', 'Maintenance work order issued to plumbing vendor.');
