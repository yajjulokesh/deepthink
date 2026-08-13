import prisma from '../utils/prisma';

export const upvoteIssue = async (issueId: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check if user already voted (Optional, DB constraint will also catch it)
    const existingVote = await tx.issue_votes.findUnique({
      where: {
        issue_id_user_id: {
          issue_id: issueId,
          user_id: userId,
        },
      },
    });

    if (existingVote) {
      throw new Error('User has already voted for this issue');
    }

    // 2. Create the vote
    await tx.issue_votes.create({
      data: {
        issue_id: issueId,
        user_id: userId,
      },
    });

    // 3. Increment the issue vote count atomically
    const updatedIssue = await tx.student_issues.update({
      where: { id: issueId },
      data: {
        current_votes: {
          increment: 1,
        },
      },
    });

    // 4. Fetch the threshold from settings (fallback to 100 if not set)
    const setting = await tx.system_settings.findUnique({
      where: { key: 'student_issue_upvote_threshold' },
    });
    const threshold = setting ? parseInt(setting.value, 10) : 100;

    // 5. Check if threshold reached
    if (updatedIssue.current_votes >= threshold && !updatedIssue.threshold_reached) {
      // Use updateMany to ensure atomic check-and-set for threshold_reached
      const updateResult = await tx.student_issues.updateMany({
        where: { 
          id: issueId, 
          threshold_reached: false 
        },
        data: { threshold_reached: true },
      });

      // If count > 0, this transaction is the one that crossed the threshold
      if (updateResult.count > 0) {
        const managementUsers = await tx.users.findMany({
          where: { role: { name: 'MANAGEMENT' } },
        });

        const notifications = managementUsers.map(user => ({
          type: 'ISSUE_THRESHOLD_REACHED',
          content: `Issue "${updatedIssue.title}" has reached the threshold of ${threshold} votes.`,
          user_id: user.id,
        }));

        if (notifications.length > 0) {
          await tx.notifications.createMany({ data: notifications });
        }
      }
    }

    // Re-fetch to return the final state
    return await tx.student_issues.findUnique({ where: { id: issueId } });
  });
};

export const removeUpvote = async (issueId: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Find the vote to delete
    const existingVote = await tx.issue_votes.findUnique({
      where: {
        issue_id_user_id: {
          issue_id: issueId,
          user_id: userId,
        },
      },
    });

    if (!existingVote) {
      throw new Error('Vote not found');
    }

    // 2. Delete the vote
    await tx.issue_votes.delete({
      where: { id: existingVote.id },
    });

    // 3. Decrement the count
    return await tx.student_issues.update({
      where: { id: issueId },
      data: {
        current_votes: {
          decrement: 1,
        },
      },
    });
  });
};
