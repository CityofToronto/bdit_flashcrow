import PgBoss from 'pg-boss';

import config from '@/lib/config/MoveConfig';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import JobUserDAO from '@/lib/db/JobUserDAO';
import JobRunnerFactory from '@/lib/jobs/JobRunnerFactory';
import JobType from '@/lib/jobs/JobType';

const PG_BOSS = new PgBoss(config.db);

class JobManager {
  static async cleanup() {
    const tasks = JobType.enumValues.map(
      jobType => PG_BOSS.unsubscribe(jobType.name),
    );
    await Promise.all(tasks);

    await PG_BOSS.stop();
  }

  static async publish(jobType, data, user) {
    const jobData = await jobType.validateData(data);
    const jobId = await PG_BOSS.publish(jobType.name, jobData);
    await JobUserDAO.create(jobId, user);
    return jobId;
  }

  static async run(job) {
    const jobMetadata = await JobMetadataDAO.create(job);
    const jobRunner = JobRunnerFactory.getInstance(job, jobMetadata);
    await jobRunner.run();
  }

  static async init() {
    await PG_BOSS.start();

    const tasks = JobType.enumValues.map(
      jobType => PG_BOSS.subscribe(
        jobType.name,
        jobType.subscribeOptions,
        JobManager.run,
      ),
    );
    await Promise.all(tasks);
  }
}

export default JobManager;
