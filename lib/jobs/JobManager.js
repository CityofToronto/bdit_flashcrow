import PgBoss from 'pg-boss';
import Worker from 'pg-boss/src/worker';
import { v4 as uuidv4 } from 'uuid';

import config from '@/lib/config/MoveConfig';
import JobDAO from '@/lib/db/JobDAO';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import JobRunnerFactory from '@/lib/jobs/JobRunnerFactory';
import JobType from '@/lib/jobs/JobType';
import LogTag from '@/lib/log/LogTag';
import DateTimeZone from '@/lib/time/DateTimeZone';

const PG_BOSS = new PgBoss({
  connectionString: config.db,
  /*
   * This forces `pg-boss` to include all `pgboss.job` columns when fetching jobs from the
   * queue, which in turn allows us to avoid a dependent call to `JobDAO.byId` in
   * `JobManager.run`.
   */
  includeMetadata: true,
  /*
   * Reducing this to a less aggressive 15-minute interval, as opposed to the default 1-minute
   * interval.  Each maintenance run logs a job in `pgboss.job`, so this can drastically reduce
   * DB load.
   */
  maintenanceIntervalMinutes: 15,
  /*
   * Disable `cron` expressions and other scheduling-related functionality - all we want is
   * the pub / sub part!  Airflow is a vastly superior tool for `cron`-like job scheduling.
   */
  noScheduling: true,
});
let SERVER = null;
let WORKER = null;

class JobManager {
  static async cancel(job) {
    const jobMetadata = await JobMetadataDAO.byJobId(job.id);
    await PG_BOSS.cancel(job.id);
    jobMetadata.state = 'cancelled';
    return JobMetadataDAO.update(jobMetadata);
  }

  static async cleanup() {
    WORKER.stop();
    await PG_BOSS.stop();
  }

  static async fetch() {
    const jobs = await PG_BOSS.fetch(`${JobType.NAME_PREFIX}*`, 1, { includeMetadata: true });
    if (jobs === null) {
      return [];
    }
    if (!Array.isArray(jobs)) {
      return [jobs];
    }
    return jobs;
  }

  static async init(server) {
    SERVER = server;
    await PG_BOSS.start();

    const { fetch, onError, onFetch } = JobManager;
    const workerConfig = {
      name: `${JobType.NAME_PREFIX}*`,
      fetch,
      onFetch,
      onError,
      interval: PG_BOSS.config.newJobCheckInterval,
    };
    WORKER = new Worker(workerConfig);
    WORKER.start();
  }

  static onError(err) {
    SERVER.log(LogTag.ERROR, err);
  }

  static async onFetch(jobs) {
    if (jobs.length === 0) {
      return;
    }
    const tasks = jobs.map(JobManager.run);
    await Promise.all(tasks);
  }

  static async publish(jobType, data, user) {
    const jobData = await jobType.validateData(data);
    const id = uuidv4();
    const job = {
      id,
      name: jobType.jobName,
      data: jobData,
      createdon: DateTimeZone.utc(),
    };
    await JobMetadataDAO.create(job, user);
    await JobDAO.create(job);
    return id;
  }

  static async run(job) {
    const { id, startedon, state } = job;
    const jobMetadata = await JobMetadataDAO.byJobId(id);
    jobMetadata.startedAt = startedon;
    jobMetadata.state = state;
    await JobMetadataDAO.update(jobMetadata);

    try {
      const jobRunner = JobRunnerFactory.getInstance(job, jobMetadata);
      const result = await jobRunner.run();
      jobMetadata.result = result;
      await PG_BOSS.complete(id);
    } catch (err) {
      await PG_BOSS.fail(id);
    }

    const jobCompleted = await JobDAO.byId(id);
    const { completedon, state: stateCompleted } = jobCompleted;
    jobMetadata.completedAt = completedon;
    jobMetadata.state = stateCompleted;
    await JobMetadataDAO.update(jobMetadata);
  }
}

PG_BOSS.on('error', JobManager.onError);

export default JobManager;
