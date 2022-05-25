import { InvalidJobTypeError } from '@/lib/error/JobErrors';
import JobRunnerGenerateReports from '@/lib/jobs/JobRunnerGenerateReports';
import JobRunnerCompressMvcrs from '@/lib/jobs/JobRunnerCompressMvcrs';
import JobType from '@/lib/jobs/JobType';

/**
 * Factory class for job types.
 */
class JobRunnerFactory {
  static getInstance(job, jobMetadata) {
    const { type } = jobMetadata;
    if (!this.classes.has(type)) {
      throw new InvalidJobTypeError(type);
    }
    const Clazz = JobRunnerFactory.classes.get(type);
    return new Clazz(job, jobMetadata);
  }

  static registerClass(type, clazz) {
    JobRunnerFactory.classes.set(type, clazz);
  }
}

/**
 * @type {Map<JobType, Object>}
 */
JobRunnerFactory.classes = new Map();

JobRunnerFactory.registerClass(JobType.GENERATE_REPORTS, JobRunnerGenerateReports);
JobRunnerFactory.registerClass(JobType.COMPRESS_MVCRS, JobRunnerCompressMvcrs);

export default JobRunnerFactory;
