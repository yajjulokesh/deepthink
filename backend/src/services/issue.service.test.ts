import { upvoteIssue } from './issue.service';
import prisma from '../utils/prisma';

jest.mock('../utils/prisma', () => ({
  $transaction: jest.fn(async (cb) => cb(prisma)),
  issue_votes: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  student_issues: {
    update: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
  },
  system_settings: {
    findUnique: jest.fn(),
  },
  users: {
    findMany: jest.fn(),
  },
  notifications: {
    createMany: jest.fn(),
  },
}));

describe('Issue Service - upvoteIssue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger notification on exactly the 100th vote', async () => {
    (prisma.issue_votes.findUnique as jest.Mock).mockResolvedValue(null);
    
    // Simulate updating issue count to 100
    (prisma.student_issues.update as jest.Mock).mockResolvedValue({
      id: 'issue1',
      current_votes: 100,
      threshold_reached: false,
      title: 'Test Issue',
    });

    // Simulate system setting threshold = 100
    (prisma.system_settings.findUnique as jest.Mock).mockResolvedValue({
      value: '100',
    });

    // Simulate this being the transaction that actually flips the flag
    (prisma.student_issues.updateMany as jest.Mock).mockResolvedValue({
      count: 1,
    });

    (prisma.users.findMany as jest.Mock).mockResolvedValue([
      { id: 'manager1', role: { name: 'MANAGEMENT' } }
    ]);

    await upvoteIssue('issue1', 'user1');

    expect(prisma.student_issues.updateMany).toHaveBeenCalledWith({
      where: { id: 'issue1', threshold_reached: false },
      data: { threshold_reached: true },
    });
    expect(prisma.notifications.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.notifications.createMany).toHaveBeenCalledWith({
      data: [{
        type: 'ISSUE_THRESHOLD_REACHED',
        content: 'Issue "Test Issue" has reached the threshold of 100 votes.',
        user_id: 'manager1',
      }]
    });
  });

  it('should NOT trigger notification on the 101st vote (threshold already reached)', async () => {
    (prisma.issue_votes.findUnique as jest.Mock).mockResolvedValue(null);
    
    // Simulate updating issue count to 101, where threshold_reached is already true in DB
    (prisma.student_issues.update as jest.Mock).mockResolvedValue({
      id: 'issue1',
      current_votes: 101,
      threshold_reached: true,
      title: 'Test Issue',
    });

    (prisma.system_settings.findUnique as jest.Mock).mockResolvedValue({
      value: '100',
    });

    await upvoteIssue('issue1', 'user2');

    // Should not attempt to flip flag or create notifications because threshold_reached is already true
    expect(prisma.student_issues.updateMany).not.toHaveBeenCalled();
    expect(prisma.notifications.createMany).not.toHaveBeenCalled();
  });
  
  it('should prevent race conditions on exactly 100 votes concurrently', async () => {
     (prisma.issue_votes.findUnique as jest.Mock).mockResolvedValue(null);
     
     (prisma.student_issues.update as jest.Mock).mockResolvedValue({
       id: 'issue1',
       current_votes: 100,
       threshold_reached: false,
       title: 'Test Issue',
     });
 
     (prisma.system_settings.findUnique as jest.Mock).mockResolvedValue({
       value: '100',
     });
 
     // Simulate that another concurrent transaction already flipped the flag, so updateMany returns count: 0
     (prisma.student_issues.updateMany as jest.Mock).mockResolvedValue({
       count: 0,
     });
 
     await upvoteIssue('issue1', 'user3');
 
     expect(prisma.student_issues.updateMany).toHaveBeenCalled();
     // Should NOT create notification because count was 0
     expect(prisma.notifications.createMany).not.toHaveBeenCalled();
  });
});
