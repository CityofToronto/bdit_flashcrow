import { v4 as uuidv4 } from 'uuid';

import { ReportFormat, ReportType } from '@/lib/Constants';
import db from '@/lib/db/db';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import UserDAO from '@/lib/db/UserDAO';
import JobType from '@/lib/jobs/JobType';
import { generateUser } from '@/lib/test/random/UserGenerator';
import DateTimeZone from '@/lib/time/DateTimeZone';

afterAll(() => {
  db.$pool.end();
});

test('JobMetadataDAO', async () => {
  const jobId1 = uuidv4();
  const transientJob1 = {
    id: jobId1,
    name: JobType.GENERATE_REPORTS.jobName,
    data: {
      reports: [
        { type: ReportType.SPEED_PERCENTILE, id: '4/12345', format: ReportFormat.PDF },
        { type: ReportType.SPEED_PERCENTILE, id: '4/67890', format: ReportFormat.PDF },
      ],
    },
    createdon: DateTimeZone.utc(),
  };

  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);

  const persistedJobMetadata1 = await JobMetadataDAO.create(transientJob1, persistedUser);
  expect(persistedJobMetadata1).toEqual({
    jobId: jobId1,
    userId: persistedUser.id,
    type: JobType.GENERATE_REPORTS,
    state: 'created',
    dismissed: false,
    progressCurrent: 0,
    progressTotal: 2,
    createdAt: transientJob1.createdon,
    startedAt: null,
    completedAt: null,
    result: null,
  });

  let fetchedJobMetadata = await JobMetadataDAO.byJobId(jobId1);
  expect(fetchedJobMetadata).toEqual(persistedJobMetadata1);

  persistedJobMetadata1.state = 'active';
  persistedJobMetadata1.startedAt = DateTimeZone.utc();
  fetchedJobMetadata = await JobMetadataDAO.update(persistedJobMetadata1);
  expect(fetchedJobMetadata).toEqual(persistedJobMetadata1);

  persistedJobMetadata1.progressCurrent = 1;
  fetchedJobMetadata = await JobMetadataDAO.update(persistedJobMetadata1);
  expect(fetchedJobMetadata).toEqual(persistedJobMetadata1);

  let fetchedJobMetadatas = await JobMetadataDAO.byUser(persistedUser);
  expect(fetchedJobMetadatas).toContainEqual(persistedJobMetadata1);

  const jobId2 = uuidv4();
  const transientJob2 = {
    id: jobId2,
    name: JobType.GENERATE_REPORTS.jobName,
    data: {
      reports: [
        { type: ReportType.COUNT_SUMMARY_24H, id: '1/4321', format: ReportFormat.CSV },
        { type: ReportType.COUNT_SUMMARY_24H, id: '1/8765', format: ReportFormat.CSV },
      ],
    },
    createdon: DateTimeZone.utc(),
  };
  const persistedJobMetadata2 = await JobMetadataDAO.create(transientJob2, persistedUser);

  fetchedJobMetadatas = await JobMetadataDAO.byUser(persistedUser);
  expect(fetchedJobMetadatas).toContainEqual(persistedJobMetadata1);
  expect(fetchedJobMetadatas).toContainEqual(persistedJobMetadata2);

  persistedJobMetadata2.state = 'completed';
  persistedJobMetadata2.progressCurrent = 2;
  persistedJobMetadata2.startedAt = persistedJobMetadata1.startedAt;
  persistedJobMetadata2.completedAt = DateTimeZone.utc();
  persistedJobMetadata2.result = { zipLink: '1f2e3d4c' };
  fetchedJobMetadata = await JobMetadataDAO.update(persistedJobMetadata2);
  expect(fetchedJobMetadata).toEqual(persistedJobMetadata2);
});
