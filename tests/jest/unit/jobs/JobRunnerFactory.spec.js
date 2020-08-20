import JobType from '@/lib/jobs/JobType';
import JobRunnerBase from '@/lib/jobs/JobRunnerBase';
import JobRunnerFactory from '@/lib/jobs/JobRunnerFactory';

test('JobRunnerFactory [coverage]', () => {
  JobType.enumValues.forEach((jobType) => {
    const jobRunner = JobRunnerFactory.getInstance(null, { type: jobType });
    expect(jobRunner).toBeInstanceOf(JobRunnerBase);
  });
});
