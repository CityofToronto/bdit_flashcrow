import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CountDAO from '@/lib/db/CountDAO';
import DateTime from '@/lib/time/DateTime';

afterAll(() => {
  db.$pool.end();
});

test('CountDAO.byStudy [TMC]', async () => {
  const result = await CountDAO.byStudy({
    legacy: true,
    countLocationId: 23945,
    endDate: DateTime.fromObject({ year: 2013, month: 5, day: 13 }),
    startDate: DateTime.fromObject({ year: 2013, month: 5, day: 13 }),
    studyType: StudyType.TMC,
  });
  expect(result).toHaveLength(1);
});

test('CountDAO.byStudy [RESCU]', async () => {
  const result = await CountDAO.byStudy({
    legacy: true,
    countLocationId: 3184,
    endDate: DateTime.fromObject({ year: 2009, month: 11, day: 20 }),
    startDate: DateTime.fromObject({ year: 2009, month: 11, day: 20 }),
    studyType: StudyType.RESCU,
  });
  expect(result).toHaveLength(1);
});

test('CountDAO.byStudy [volume ATR, single-day, single-direction]', async () => {
  const result = await CountDAO.byStudy({
    legacy: true,
    countLocationId: 32532,
    endDate: DateTime.fromObject({ year: 2012, month: 12, day: 20 }),
    startDate: DateTime.fromObject({ year: 2012, month: 12, day: 20 }),
    studyType: StudyType.ATR_SPEED_VOLUME,
  });
  expect(result).toHaveLength(1);
});

// skip: the values under observation is randonly generated and therefore insconsistent
test.skip('CountDAO.byStudy [volume ATR, multi-day, single-direction]', async () => {
  const result = await CountDAO.byStudy({
    legacy: true,
    countLocationId: 38438,
    endDate: DateTime.fromObject({ year: 2017, month: 6, day: 15 }),
    startDate: DateTime.fromObject({ year: 2017, month: 6, day: 13 }),
    studyType: StudyType.ATR_SPEED_VOLUME,
  });
  expect(result).toHaveLength(3);
});

test('CountDAO.byStudy [volume ATR, multi-day, multi-direction]', async () => {
  const result = await CountDAO.byStudy({
    legacy: true,
    countLocationId: 32532,
    endDate: DateTime.fromObject({ year: 2009, month: 9, day: 17 }),
    startDate: DateTime.fromObject({ year: 2009, month: 9, day: 15 }),
    studyType: StudyType.ATR_VOLUME,
  });
  expect(result).toHaveLength(6);
});

test('CountDAO.byStudy [study with notes]', async () => {
  const result = await CountDAO.byStudy({
    legacy: true,
    countLocationId: 3184,
    endDate: DateTime.fromObject({ year: 2009, month: 5, day: 10 }),
    startDate: DateTime.fromObject({ year: 2009, month: 5, day: 10 }),
    studyType: StudyType.RESCU,
  });
  expect(result).toHaveLength(1);
});
