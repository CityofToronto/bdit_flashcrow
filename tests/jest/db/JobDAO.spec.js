import PgBoss from 'pg-boss';
import { v4 as uuidv4 } from 'uuid';

import { ReportFormat, ReportType } from '@/lib/Constants';
import db from '@/lib/db/db';
import JobDAO from '@/lib/db/JobDAO';
import JobType from '@/lib/jobs/JobType';
import PgBossDatabaseWrapper from '@/lib/jobs/PgBossDatabaseWrapper';
import DateTimeZone from '@/lib/time/DateTimeZone';

const PG_BOSS = new PgBoss({
  db: PgBossDatabaseWrapper,
  noScheduling: true,
  noSupervisor: true,
});

beforeAll(async () => {
  await PG_BOSS.start();
});

afterAll(async () => {
  await PG_BOSS.stop();
  db.$pool.end();
});

test('JobDAO', async () => {
  const id = uuidv4();
  const transientJob = {
    id,
    name: JobType.GENERATE_REPORTS.jobName,
    data: {
      reports: [
        { type: ReportType.SPEED_PERCENTILE, id: '4/12345', format: ReportFormat.PDF },
        { type: ReportType.SPEED_PERCENTILE, id: '4/67890', format: ReportFormat.PDF },
      ],
    },
    createdon: DateTimeZone.utc(),
  };
  const persistedJob = await JobDAO.create(transientJob);
  expect(persistedJob.state).toEqual('created');

  const fetchedJob = await JobDAO.byId(id);
  expect(fetchedJob).toEqual(persistedJob);
});