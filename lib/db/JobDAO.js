import db from '@/lib/db/db';
import JobType from '@/lib/jobs/JobType';
import Job from '@/lib/model/Job';

const PGBOSS_FIELDS = `
  id,
  name,
  data,
  state,
  createdon,
  startedon,
  completedon`;

const JOB_FIELDS = `${PGBOSS_FIELDS}
  FROM pgboss.job`;
const ARCHIVE_FIELDS = `${PGBOSS_FIELDS}
  FROM pgboss.archive`;

async function normalizeJob(job) {
  const jobNormalized = await Job.read.validateAsync(job);
  const { data, name } = jobNormalized;
  const jobType = JobType.enumValueOf(name, 'jobName');
  const dataNormalized = await jobType.dataSchema.validateAsync(data);
  jobNormalized.data = dataNormalized;
  return jobNormalized;
}

/**
 * Data access layer for creating `pg-boss` jobs directly, and for fetching `pg-boss` job info.
 * This class is primarily designed for use in {@link JobManager}, where it is used to help manage
 * jobs from when they are created to right after completion.
 *
 * Note that `pg-boss` archives jobs regularly after the configured time-to-archive.  This means
 * that we have to search both `pgboss.job` and `pgboss.archive` for jobs.
 *
 * Furthermore, `pg-boss` deletes jobs from `pgboss.archive` after the configured time-to-delete.
 * As such, older jobs may have a record in `job_metadata` but be missing from `pg-boss` schemas.
 * If you need to query historical job results, you should use {@link JobMetadataDAO}.
 */
class JobDAO {
  static async create(job) {
    const sql = `
INSERT INTO pgboss.job (
  "id",
  "name",
  "data",
  "state",
  "createdon",
  "startedon",
  "completedon"
) VALUES (
  $(id),
  $(name),
  $(data),
  $(state),
  $(createdon),
  $(startedon),
  $(completedon)
)`;
    const persistedJob = {
      state: 'created',
      startedon: null,
      completedon: null,
      ...job,
    };
    await db.query(sql, persistedJob);
    return normalizeJob(persistedJob);
  }

  static async byId(id) {
    const sql = `
SELECT ${JOB_FIELDS} WHERE id = $(id)
UNION SELECT ${ARCHIVE_FIELDS} WHERE id = $(id)`;
    const job = await db.oneOrNone(sql, { id });
    if (job === null) {
      return null;
    }
    return normalizeJob(job);
  }
}

export default JobDAO;
