import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import { NotImplementedError } from '@/lib/error/MoveErrors';

class JobRunnerBase {
  constructor(job, jobMetadata) {
    this.job = job;
    this.jobMetadata = jobMetadata;
    this.data = null;
  }

  async init() {
    const { data } = this.job;
    const { type } = this.jobMetadata;
    this.data = await type.validateData(data);
  }

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

  /* eslint-disable-next-line class-methods-use-this, no-unused-vars */
  async runImpl(data) {
    throw new NotImplementedError();
  }
}

export default JobRunnerBase;
