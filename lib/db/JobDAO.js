import db from '@/lib/db/db';
import JobType from '@/lib/jobs/JobType';
import Job from '@/lib/model/Job';

const JOB_FIELDS = `
  id,
  name,
  data,
  state,
  createdon,
  startedon,
  completedon
  FROM pgboss.job`;

const ARCHIVE_FIELDS = `
  id,
  name,
  data,
  state,
  createdon,
  startedon,
  completedon
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
 * Data access layer for combining `pg-boss` job info with MOVE-specific extensions
 * for additional metadata and lookup-by-user.s
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
