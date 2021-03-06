import PgBoss from 'pg-boss';
import Worker from 'pg-boss/src/worker';
import { v4 as uuidv4 } from 'uuid';

import JobDAO from '@/lib/db/JobDAO';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import JobRunnerFactory from '@/lib/jobs/JobRunnerFactory';
import PgBossDatabaseWrapper from '@/lib/jobs/PgBossDatabaseWrapper';
import JobType from '@/lib/jobs/JobType';
import LogTag from '@/lib/log/LogTag';
import DateTimeZone from '@/lib/time/DateTimeZone';

const PG_BOSS = new PgBoss({
  db: PgBossDatabaseWrapper,
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

/**
 * Wrapper class for `pg-boss` functionality.  This ensures that `pg-boss` resources are properly
 * initialized and cleaned up, and it also calls {@link JobMetadataDAO} to keep the MOVE-specific
 * job metadata record in sync with the corresponding `pg-boss` job.
 */
class JobManager {
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
    const jobData = await jobType.dataSchema.validateAsync(data);
    const id = uuidv4();
    const job = {
      id,
      name: jobType.jobName,
      data: jobData,
      createdon: DateTimeZone.utc(),
    };
    const jobMetadata = await JobMetadataDAO.create(job, user);
    await JobDAO.create(job);
    return jobMetadata;
  }

  static async run(job) {
    const { id, startedon, state } = job;
    const jobMetadata = await JobMetadataDAO.byJobId(id);
    jobMetadata.startedAt = startedon;
    jobMetadata.state = state;
    await JobMetadataDAO.update(jobMetadata);

    try {
      const jobRunner = JobRunnerFactory.getInstance(job, jobMetadata);
      await jobRunner.init();
      const result = await jobRunner.run();
      jobMetadata.result = result;
      await PG_BOSS.complete(id);
    } catch (err) {
      JobManager.onError(err);
      await PG_BOSS.fail(id);
    }

    const jobCompleted = await JobDAO.byId(id);
    const { completedon, state: stateCompleted } = jobCompleted;
    const persistedJobMetadata = {
      ...jobMetadata,
      completedAt: completedon,
      state: stateCompleted,
      dismissed: stateCompleted !== 'completed',
    };
    await JobMetadataDAO.update(persistedJobMetadata);
  }

  static async cancel(jobMetadata) {
    const { jobId } = jobMetadata;
    await PG_BOSS.cancel(jobId);

    const jobCancelled = await JobDAO.byId(jobId);
    const persistedJobMetadata = {
      ...jobMetadata,
      dismissed: true,
      state: jobCancelled.state,
    };
    return JobMetadataDAO.update(persistedJobMetadata);
  }
}

PG_BOSS.on('error', JobManager.onError);

export default JobManager;
