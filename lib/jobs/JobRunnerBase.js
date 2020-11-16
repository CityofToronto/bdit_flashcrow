import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import { NotImplementedError } from '@/lib/error/MoveErrors';

/**
 * Base class for all background job runners.  Runners execute background jobs via their
 * implementations of {@link JobRunnerBase.runImpl}. During execution, they can optionally
 * update progress via {@link JobRunnerBase.incrProgressCurrent}; this is used to help
 * display progress notifications in the frontend, and for failed jobs can also provide
 * more information on where the failure occurred.
 */
class JobRunnerBase {
  constructor(job, jobMetadata) {
    this.job = job;
    this.jobMetadata = jobMetadata;
    this.data = null;
  }

  async init() {
    const { data } = this.job;
    const { type } = this.jobMetadata;
    this.data = await type.dataSchema.validateAsync(data);
  }

  /**
   * Increments the `progressCurrent` field of the `JobMetadata` record associated with this job.
   * For instance, {@link JobRunnerGenerateReports} calls this for each report generated.
   *
   * @param {number} n - amount to increment progress by (default 1)
   */
  async incrProgressCurrent(n = 1) {
    this.jobMetadata.progressCurrent += n;
    await JobMetadataDAO.update(this.jobMetadata);
  }

  async run() {
    if (this.data === null) {
      throw new Error('must call init() before run() on job runner');
    }
    return this.runImpl(this.data);
  }

  /**
   * Runs the given job.  This method is responsible for ensuring that any resources opened /
   * acquired are closed / released before exiting.
   *
   * @param {Object} data - data provided during job creation
   */
  /* eslint-disable-next-line class-methods-use-this, no-unused-vars */
  async runImpl(data) {
    throw new NotImplementedError();
  }
}

export default JobRunnerBase;
