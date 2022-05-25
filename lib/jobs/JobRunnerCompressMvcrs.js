import JobRunnerBase from '@/lib/jobs/JobRunnerBase';

class JobRunnerCompressMvcrs extends JobRunnerBase {
  async runImpl() {
    await this.incrProgressCurrent();
    return null;
  }
}

export default JobRunnerCompressMvcrs;
