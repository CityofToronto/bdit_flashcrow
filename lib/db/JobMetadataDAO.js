import db from '@/lib/db/db';
import JobDescription from '@/lib/jobs/JobDescription';
import JobType from '@/lib/jobs/JobType';
import {
  normalizeJobMetadata,
  normalizeJobMetadatas,
} from '@/lib/model/helpers/NormalizeUtils';

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
   * @param {Object} job - transient job instance to link this job metadata to
   * @param {Object} user - user that owns the job
   */
  static async create(job, user) {
    const {
      createdon: createdAt,
      data,
      id: jobId,
      name,
    } = job;
    const jobType = JobType.enumValueOf(name, 'jobName');
    const jobDescription = await JobDescription.get(jobType, data);
    let metadata = jobType.getMetadata(data);
    metadata = await jobType.validateMetadata(metadata);
    const progressTotal = jobType.getProgressTotal(data);

    const sql = `
INSERT INTO "job_metadata" (
  "jobId",
  "userId",
  "type",
  "description",
  "state",
  "dismissed",
  "progressCurrent",
  "progressTotal",
  "createdAt",
  "startedAt",
  "completedAt",
  "metadata",
  "result"
) VALUES (
  $(jobId),
  $(userId),
  $(type),
  $(description),
  $(state),
  $(dismissed),
  $(progressCurrent),
  $(progressTotal),
  $(createdAt),
  $(startedAt),
  $(completedAt),
  $(metadata),
  $(result)
)`;
    const { id: userId } = user;
    const persistedJobMetadata = {
      jobId,
      userId,
      type: jobType,
      description: jobDescription,
      state: 'created',
      dismissed: false,
      progressCurrent: 0,
      progressTotal,
      createdAt,
      startedAt: null,
      completedAt: null,
      metadata,
      result: null,
    };
    await db.query(sql, persistedJobMetadata);
    return normalizeJobMetadata(persistedJobMetadata);
  }

  static async byJobId(jobId) {
    const sql = 'SELECT * FROM job_metadata WHERE "jobId" = $(jobId)';
    const persistedJobMetadata = await db.oneOrNone(sql, { jobId });
    return normalizeJobMetadata(persistedJobMetadata);
  }

  static async byUser(user) {
    const sql = `
SELECT * FROM job_metadata
WHERE "userId" = $(userId)
ORDER BY "createdAt" DESC`;
    const { id: userId } = user;
    const persistedJobMetadatas = await db.manyOrNone(sql, { userId });
    return normalizeJobMetadatas(persistedJobMetadatas);
  }

  static async byUserExistsNew(user) {
    const sql = `
SELECT EXISTS (
  SELECT 1 FROM job_metadata
  WHERE "userId" = $(userId)
  AND NOT "dismissed"
) AS "existsNew"`;
    const { id: userId } = user;
    const result = await db.one(sql, { userId });
    return result.existsNew;
  }

  static async update(jobMetadata) {
    const sql = `
UPDATE "job_metadata" SET
  "state" = $(state),
  "dismissed" = $(dismissed),
  "progressCurrent" = $(progressCurrent),
  "progressTotal" = $(progressTotal),
  "startedAt" = $(startedAt),
  "completedAt" = $(completedAt),
  "result" = $(result)
  WHERE "jobId" = $(jobId)`;
    await db.query(sql, jobMetadata);
    return normalizeJobMetadata(jobMetadata);
  }
}

export default JobMetadataDAO;
