import { InvalidJobTypeError } from '@/lib/error/JobErrors';
import JobRunnerGenerateReports from '@/lib/jobs/JobRunnerGenerateReports';
import JobType from '@/lib/jobs/JobType';

/**
 * Factory class for job types.
 */
class JobRunnerFactory {
  static getInstance(job, jobMetadata) {
    const jobType = JobType.enumValueOf(job.name);
    if (!this.classes.has(jobType)) {
      throw new InvalidJobTypeError(jobType);
    }
    const Clazz = JobRunnerFactory.classes.get(jobType);
    return new Clazz(job, jobMetadata);
  }

  static registerClass(jobType, clazz) {
    JobRunnerFactory.classes.set(jobType, clazz);
  }
}

/**
 * @type {Map<JobType, Object>}
 */
JobRunnerFactory.classes = new Map();

JobRunnerFactory.registerClass(JobType.GENERATE_REPORTS, JobRunnerGenerateReports);

export default JobRunnerFactory;
