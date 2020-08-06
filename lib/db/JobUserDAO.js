import db from '@/lib/db/db';

/**
 * Data access layer for linking `pg-boss` jobs to users.
 */
class JobUserDAO {
  static async create(jobId, user) {
    const sql = `
INSERT INTO "job_users" (
  "jobId",
  "userId"
) VALUES (
  $(jobId),
  $(userId)
)`;

    const { id: userId } = user;
    const jobUser = { jobId, userId };
    await db.query(sql, jobUser);
    return jobUser;
  }

  static async byUser(user) {
    const { id: userId } = user;
    const sql = 'SELECT "jobId" FROM job_users WHERE "userId" = $(userId)';
    const rows = await db.manyOrNone(sql, { userId });
    return rows.map(({ jobId }) => jobId);
  }
}

export default JobUserDAO;
