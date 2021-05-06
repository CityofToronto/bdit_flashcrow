import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import CountDAO from '@/lib/db/CountDAO';
import DateTime from '@/lib/time/DateTime';

afterAll(() => {
  db.$pool.end();
});

test('CountDAO.byStudy', async () => {
  // TMC: single-day, single-arterycode
  let result = await CountDAO.byStudy({
    arteryGroupId: 23945,
    endDate: DateTime.fromObject({ year: 2013, month: 5, day: 13 }),
    startDate: DateTime.fromObject({ year: 2013, month: 5, day: 13 }),
    type: { id: 5, studyType: StudyType.TMC },
  });
  expect(result).toHaveLength(1);

  // RESCU: not aggregated across days
  result = await CountDAO.byStudy({
    arteryGroupId: 3184,
    endDate: DateTime.fromObject({ year: 2009, month: 11, day: 20 }),
    startDate: DateTime.fromObject({ year: 2009, month: 11, day: 20 }),
    type: { id: 2, studyType: StudyType.RESCU },
  });
  expect(result).toHaveLength(1);

  // volume ATR: single-day, single-direction
  result = await CountDAO.byStudy({
    arteryGroupId: 32532,
    endDate: DateTime.fromObject({ year: 2012, month: 12, day: 20 }),
    startDate: DateTime.fromObject({ year: 2012, month: 12, day: 20 }),
    type: { id: 4, studyType: StudyType.ATR_SPEED_VOLUME },
  });
  expect(result).toHaveLength(1);

  // volume ATR: multi-day, single-direction
  result = await CountDAO.byStudy({
    arteryGroupId: 38438,
    endDate: DateTime.fromObject({ year: 2017, month: 6, day: 15 }),
    startDate: DateTime.fromObject({ year: 2017, month: 6, day: 13 }),
    type: { id: 4, studyType: StudyType.ATR_SPEED_VOLUME },
  });
  expect(result).toHaveLength(3);

  // volume ATR: multi-day, multi-direction
  result = await CountDAO.byStudy({
    arteryGroupId: 32532,
    endDate: DateTime.fromObject({ year: 2009, month: 9, day: 17 }),
    startDate: DateTime.fromObject({ year: 2009, month: 9, day: 15 }),
    type: { id: 1, studyType: StudyType.ATR_VOLUME },
  });
  expect(result).toHaveLength(6);

  // study with notes
  result = await CountDAO.byStudy({
    arteryGroupId: 3184,
    endDate: DateTime.fromObject({ year: 2009, month: 5, day: 10 }),
    startDate: DateTime.fromObject({ year: 2009, month: 5, day: 10 }),
    type: { id: 2, studyType: StudyType.RESCU },
  });
  expect(result).toHaveLength(1);
});
