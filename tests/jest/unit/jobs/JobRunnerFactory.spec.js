import JobType from '@/lib/jobs/JobType';
import JobRunnerFactory from '@/lib/jobs/JobRunnerFactory';

test('JobRunnerFactory [coverage]', () => {
  JobType.enumValues.forEach((jobType) => {
    expect(() => {
      JobRunnerFactory.getInstance(null, { type: jobType });
    }).not.toThrow();
  });
});
