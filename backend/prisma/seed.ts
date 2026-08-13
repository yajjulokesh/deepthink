import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database for Student Portal...');

  // 1. Roles
  const rolesData = [
    { name: 'STUDENT', permissions: 'view_all,upvote_issues,create_lost_found,comment' },
    { name: 'REPRESENTATIVE', permissions: 'view_all,upvote_issues,create_lost_found,comment,create_issues' },
    { name: 'MANAGEMENT', permissions: 'view_all,publish_announcements,respond_issues,update_status' },
    { name: 'ADMIN', permissions: 'all' },
  ];

  for (const r of rolesData) {
    await prisma.roles.upsert({
      where: { name: r.name },
      update: { permissions: r.permissions },
      create: r,
    });
  }

  const studentRole = await prisma.roles.findUnique({ where: { name: 'STUDENT' } });
  const repRole = await prisma.roles.findUnique({ where: { name: 'REPRESENTATIVE' } });
  const mgmtRole = await prisma.roles.findUnique({ where: { name: 'MANAGEMENT' } });
  const adminRole = await prisma.roles.findUnique({ where: { name: 'ADMIN' } });

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Demo Users
  const student = await prisma.users.upsert({
    where: { email: 'student@college.edu' },
    update: {},
    create: {
      name: 'Alex Johnson (Student)',
      email: 'student@college.edu',
      password: passwordHash,
      role_id: studentRole!.id,
    },
  });

  const rep = await prisma.users.upsert({
    where: { email: 'rep@college.edu' },
    update: {},
    create: {
      name: 'Priya Sharma (Student Rep)',
      email: 'rep@college.edu',
      password: passwordHash,
      role_id: repRole!.id,
    },
  });

  const mgmt = await prisma.users.upsert({
    where: { email: 'management@college.edu' },
    update: {},
    create: {
      name: 'Dr. Robert Vance (Dean of Student Affairs)',
      email: 'management@college.edu',
      password: passwordHash,
      role_id: mgmtRole!.id,
    },
  });

  const admin = await prisma.users.upsert({
    where: { email: 'admin@college.edu' },
    update: {},
    create: {
      name: 'Campus System Admin',
      email: 'admin@college.edu',
      password: passwordHash,
      role_id: adminRole!.id,
    },
  });

  // 3. System Settings
  await prisma.system_settings.upsert({
    where: { key: 'student_issue_upvote_threshold' },
    update: { value: '100' },
    create: {
      key: 'student_issue_upvote_threshold',
      value: '100',
      description: 'Number of student upvotes required to automatically trigger a Management notification',
    },
  });

  // 4. Sample Lost & Found Posts
  await prisma.lost_found_posts.create({
    data: {
      title: 'Lost: Black Leather Wristwatch',
      description: 'I lost my Fossil black leather wristwatch near the central library reading room around 2 PM today. Has sentimental value!',
      type: 'LOST',
      category: 'Electronics / Accessories',
      location: 'Central Library, 2nd Floor',
      date: new Date(),
      status: 'OPEN',
      user_id: student.id,
      comments: {
        create: [
          {
            content: 'I saw a watch at the main library reception desk around 3:30 PM! Check with the librarian.',
            user_id: rep.id,
          },
        ],
      },
    },
  });

  await prisma.lost_found_posts.create({
    data: {
      title: 'Found: Blue Scientific Calculator (FX-991EX)',
      description: 'Found a blue Casio scientific calculator on bench #4 near the Block B Canteen.',
      type: 'FOUND',
      category: 'Stationery / Electronics',
      location: 'Block B Canteen Benches',
      date: new Date(),
      status: 'OPEN',
      user_id: rep.id,
    },
  });

  // 5. Sample Official Announcements (Including Misinformation Clarification)
  await prisma.announcements.create({
    data: {
      title: 'OFFICIAL CLARIFICATION: Examination Schedule for Tomorrow',
      content: 'The information circulating on social media regarding the cancellation of tomorrow\'s mid-semester examination is INCORRECT. All examinations will proceed strictly according to the published timetable.',
      priority: 'URGENT',
      official_clarification: true,
      comments_enabled: false,
      author_id: mgmt.id,
    },
  });

  await prisma.announcements.create({
    data: {
      title: 'Campus Tech Fest 2026 Registration Open',
      content: 'Annual Tech Fest registrations are officially open! Student projects can submit proposals through the main portal until the end of the week.',
      priority: 'NORMAL',
      official_clarification: false,
      comments_enabled: true,
      author_id: mgmt.id,
    },
  });

  // 6. Sample Representative Student Issues
  const issue1 = await prisma.student_issues.create({
    data: {
      title: 'Unreliable Water Supply & Hot Water Deficit in Hostel Block A',
      description: 'Hostel Block A residents have experienced frequent hot water outages during morning hours (6 AM - 9 AM) for the past week. Affects over 400 resident students.',
      category: 'Hostel Facilities',
      status: 'ACTION_PLANNED',
      current_votes: 350,
      threshold_reached: true,
      author_id: rep.id,
      management_responses: {
        create: [
          {
            response: 'Maintenance engineering team inspected the boiler pressure valve today. Replacement components have been dispatched and repairs will conclude by Friday.',
            management_user_id: mgmt.id,
          },
        ],
      },
      status_history: {
        create: [
          {
            old_status: 'SUBMITTED',
            new_status: 'UNDER_REVIEW',
            reason: 'Threshold reached, assigned to campus infrastructure team',
            changed_by: mgmt.id,
          },
          {
            old_status: 'UNDER_REVIEW',
            new_status: 'ACTION_PLANNED',
            reason: 'Boiler parts ordered for hostel block A',
            changed_by: mgmt.id,
          },
        ],
      },
    },
  });

  await prisma.student_issues.create({
    data: {
      title: 'Block B Classroom Ceiling Fan Faults',
      description: 'Ceiling fans in rooms B-201, B-202, and B-204 are malfunctioning, creating noise and poor ventilation during afternoon lectures.',
      category: 'Infrastructure',
      status: 'SUBMITTED',
      current_votes: 82,
      threshold_reached: false,
      author_id: rep.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
