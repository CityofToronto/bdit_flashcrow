import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import { NotImplementedError } from '@/lib/error/MoveErrors';

class JobRunnerBase {
  constructor(job, jobMetadata) {
    this.job = job;
    this.jobMetadata = jobMetadata;
  }

  async incrProgressCurrent(n = 1) {
    this.jobMetadata.progressCurrent += n;
    await JobMetadataDAO.update(this.jobMetadata);
  }

  async updateMetadata(metadata) {
    this.jobMetadata.metadata = {
      ...this.jobMetadata.metadata,
      ...metadata,
    };
    await JobMetadataDAO.update(this.jobMetadata);
  }

  /* eslint-disable-next-line class-methods-use-this */
  async run() {
    throw new NotImplementedError();
  }
}

export default JobRunnerBase;
