import db from '@/lib/db/db';
import JobMetadata from '@/lib/model/JobMetadata';

/**
 * Data access layer for background job metadata.
 *
 * To allow `pg-boss` sole ownership of the `pgboss` schema and all its tables, MOVE keeps a
 * separate `job_metadata` table to store additional metadata about jobs.  In particular, this
 * metadata table can be used during job execution to monitor progress, and can also be used
 * after execution to store results (e.g. links to bulk report ZIP archives).  It also helps
 * us link `pg-boss` jobs to the users that submitted them.
 */
class JobMetadataDAO {
  /**
   * Create a metadata record for the given job, owned by the given user.
   *
   * @param {Object} jobMetadata - metadata record
   * @param {Object} job - job this metadata record is linked to
   * @param {Object} user - user that submitted the given job
   */
  static async create(jobMetadata, job, user) {
    const sql = `
INSERT INTO "job_metadata" (
  "jobId",
  "userId",
  "progressCurrent",
  "progressTotal",
  "metadata"
) VALUES (
  $(jobId),
  $(userId),
  $(progressCurrent),
  $(progressTotal),
  $(metadata),
)`;
    const { id: jobId } = job;
    const { id: userId } = user;
    const persistedJobMetadata = {
      jobId,
      userId,
      progressCurrent: 0,
      ...jobMetadata,
    };
    await db.query(sql, persistedJobMetadata);
    return JobMetadata.read.validateAsync(persistedJobMetadata);
  }

  static async update(jobMetadata) {
    const sql = `
UPDATE "job_metadata" SET
  "progressCurrent" = $(progressCurrent),
  "progressTotal" = $(progressTotal),
  "metadata" = $(metadata)
  WHERE "jobId" = $(jobId)`;
    await db.query(sql, jobMetadata);
    return JobMetadata.read.validateAsync(jobMetadata);
  }
}

export default JobMetadataDAO;
