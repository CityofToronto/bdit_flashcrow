import db from '@/lib/db/db';
import JobType from '@/lib/jobs/JobType';
import JobMetadata from '@/lib/model/JobMetadata';
import Joi from '@/lib/model/Joi';

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
   * @param {Object} job - job this metadata record is linked to
   */
  static async create(job) {
    const { data, id: jobId, name } = job;
    const jobType = JobType.enumValueOf(name);
    const jobMetadata = jobType.getJobMetadata(data);

    const sql = `
INSERT INTO "job_metadata" (
  "jobId",
  "dismissed",
  "progressCurrent",
  "progressTotal",
  "metadata"
) VALUES (
  $(jobId),
  $(dismissed),
  $(progressCurrent),
  $(progressTotal),
  $(metadata),
)`;
    const persistedJobMetadata = {
      jobId,
      dismissed: false,
      progressCurrent: 0,
      ...jobMetadata,
    };
    await db.query(sql, persistedJobMetadata);
    return JobMetadata.read.validateAsync(persistedJobMetadata);
  }

  static async byJobId(jobId) {
    const sql = 'SELECT * FROM job_metadata WHERE "jobId" = $(jobId)';
    const persistedJobMetadata = await db.oneOrNone(sql, { jobId });
    return JobMetadata.read.validateAsync(persistedJobMetadata);
  }

  static async byJobIds(jobIds) {
    if (jobIds.length === 0) {
      return [];
    }
    const sql = 'SELECT * FROM job_metadata WHERE "jobId" IN ($(jobIds:csv))';
    const persistedJobMetadatas = await db.oneOrNone(sql, { jobIds });
    const jobMetadatasSchema = Joi.array().items(JobMetadata.read);
    return jobMetadatasSchema.validateAsync(persistedJobMetadatas);
  }

  static async update(jobMetadata) {
    const sql = `
UPDATE "job_metadata" SET
  "dismissed" = $(dismissed),
  "progressCurrent" = $(progressCurrent),
  "metadata" = $(metadata)
  WHERE "jobId" = $(jobId)`;
    await db.query(sql, jobMetadata);
    return JobMetadata.read.validateAsync(jobMetadata);
  }
}

export default JobMetadataDAO;
