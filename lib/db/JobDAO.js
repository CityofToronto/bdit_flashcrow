import { mapBy } from '@/lib/MapUtils';
import db from '@/lib/db/db';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import JobUserDAO from '@/lib/db/JobUserDAO';

/**
 * Data access layer for combining `pg-boss` job info with MOVE-specific extensions
 * for additional metadata and lookup-by-user.
 */
class JobDAO {
  static async byId(id) {
    const jobSql = 'SELECT * FROM pgboss.job WHERE id = $(id)';
    const [job, jobMetadata] = await Promise.all([
      db.oneOrNone(jobSql, { id }),
      JobMetadataDAO.byJobId(id),
    ]);
    if (job === null) {
      return null;
    }
    return { job, jobMetadata };
  }

  static async byUser(user) {
    const ids = await JobUserDAO.byUser(user);
    if (ids.length === 0) {
      return [];
    }

    const jobsSql = `
SELECT * FROM pgboss.job
WHERE id IN ($(ids:csv))
ORDER BY startedon DESC`;
    const [jobs, jobMetadatas] = await Promise.all([
      db.manyOrNone(jobsSql, { ids }),
      JobMetadataDAO.byJobIds(ids),
    ]);
    const jobMetadatasByJobId = mapBy(jobMetadatas, jobMetadata => jobMetadata.jobId);
    return jobs.map((job) => {
      if (job === null) {
        return null;
      }
      const jobMetadata = jobMetadatasByJobId.get(job.id);
      return { job, jobMetadata };
    });
  }
}

export default JobDAO;
