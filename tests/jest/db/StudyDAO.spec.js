import { CentrelineType, StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyDAO from '@/lib/db/StudyDAO';
import { InvalidStudyQueryError } from '@/lib/error/MoveErrors';
import Category from '@/lib/model/Category';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import DateTime from '@/lib/time/DateTime';

afterAll(() => {
  db.$pool.end();
});

test('StudyDAO.byCentreline()', async () => {
  // invalid feature
  let features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  let studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(0);

  // invalid date range (start > end)
  features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 12, day: 31 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  await expect(
    StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 }),
  ).rejects.toBeInstanceOf(InvalidStudyQueryError);

  // valid feature with less than 10 counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(2);
  await expect(
    Joi.array().items(Study.read).validateAsync(studies),
  ).resolves.toEqual(studies);
  expect(studies[0].duration).toBe(72);
  expect(studies[0].hours).toBeNull();
  expect(studies[1].duration).toBe(72);
  expect(studies[1].hours).toBeNull();

  // valid feature with less than 10 counts, date range filters to empty
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2019, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(0);

  // valid feature with more than 10 counts
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.RESCU],
  };
  studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(10);

  // valid feature with more than 10 counts, date range filters to less
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2015, month: 4, day: 15 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 4, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.RESCU],
  };
  studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(8);

  // pagination works
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.RESCU],
  };
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  const { n } = studySummary[0];
  for (let offset = 0; offset < n; offset += 100) {
    /* eslint-disable-next-line no-await-in-loop */
    studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 100, offset });
    const expectedLength = Math.min(100, n - offset);
    expect(studies).toHaveLength(expectedLength);
  }
});

function expectNumPerCategoryStudy(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([n0, value0], i) => {
    const { category: { studyType: { name: value } }, n } = actual[i];
    expect(n).toBe(n0);
    expect(value).toBe(value0);
  });
}

test('StudyDAO.byCentrelineSummary()', async () => {
  // invalid feature
  let features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  let studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expectNumPerCategoryStudy(studySummary, []);

  // invalid date range (start > end)
  features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 12, day: 31 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  await expect(
    StudyDAO.byCentrelineSummary(features, studyQuery),
  ).rejects.toBeInstanceOf(InvalidStudyQueryError);

  // centreline feature with no counts
  features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expectNumPerCategoryStudy(studySummary, []);

  // centreline feature with some counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  const studySummarySchema = Joi.array().items(
    Joi.object().keys({
      category: Category.read,
      mostRecent: Study.read,
      n: Joi.number().integer().positive().required(),
    }),
  );
  expectNumPerCategoryStudy(studySummary, [[4, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']]);
  await expect(
    studySummarySchema.validateAsync(studySummary),
  ).resolves.toEqual(studySummary);

  // valid feature with some counts, date range filters to empty
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2019, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expectNumPerCategoryStudy(studySummary, []);

  // centreline feature with lots of counts
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expectNumPerCategoryStudy(studySummary, [[3633, 'RESCU']]);

  // centreline feature with lots of counts, date range filters to empty
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 1980, month: 1, day: 2 }),
    dateRangeStart: DateTime.fromObject({ year: 1980, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expectNumPerCategoryStudy(studySummary, []);

  // centreline feature with lots of counts, date range filters down
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2016, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expectNumPerCategoryStudy(studySummary, [[187, 'RESCU']]);

  // centreline feature with more than one kind of count
  features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expectNumPerCategoryStudy(studySummary, [[1, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']]);
});

function expectNumPerCategoryAndLocationStudy(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([ns0, value0], i) => {
    const { category: { studyType: { name: value } }, perLocation } = actual[i];
    perLocation.forEach(({ n }, j) => {
      expect(n).toBe(ns0[j]);
    });
    expect(value).toBe(value0);
  });
}

test('StudyDAO.byCentrelineSummaryPerLocation()', async () => {
  // invalid feature
  let features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  let studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expectNumPerCategoryAndLocationStudy(studySummary, []);

  // invalid date range (start > end)
  features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 12, day: 31 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: [StudyType.TMC],
  };
  await expect(
    StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery),
  ).rejects.toBeInstanceOf(InvalidStudyQueryError);

  // centreline feature with no counts
  features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expectNumPerCategoryAndLocationStudy(studySummary, []);

  // centreline feature with some counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  const studySummaryPerLocationSchema = Joi.array().items(
    Joi.object().keys({
      category: Category.read,
      perLocation: Joi.array().items(
        Joi.object().keys({
          mostRecent: Study.read.allow(null),
          n: Joi.number().integer().min(0).required(),
        }),
      ),
    }),
  );
  expectNumPerCategoryAndLocationStudy(
    studySummary,
    [[[4], 'ATR_VOLUME'], [[2], 'ATR_SPEED_VOLUME']],
  );
  await expect(
    studySummaryPerLocationSchema.validateAsync(studySummary),
  ).resolves.toEqual(studySummary);

  // valid feature with some counts, date range filters to empty
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2019, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expectNumPerCategoryAndLocationStudy(studySummary, []);

  // centreline feature with lots of counts
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expectNumPerCategoryAndLocationStudy(studySummary, [[[3633], 'RESCU']]);

  // centreline feature with lots of counts, date range filters to empty
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 1980, month: 1, day: 2 }),
    dateRangeStart: DateTime.fromObject({ year: 1980, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expectNumPerCategoryAndLocationStudy(studySummary, []);

  // centreline feature with lots of counts, date range filters down
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2016, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 1, day: 1 }),
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expectNumPerCategoryAndLocationStudy(studySummary, [[[187], 'RESCU']]);

  // centreline feature with more than one kind of count
  features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  studyQuery = {
    daysOfWeek: null,
    hours: null,
    studyTypes: null,
  };
  studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expectNumPerCategoryAndLocationStudy(studySummary, [[[1], 'ATR_VOLUME'], [[2], 'ATR_SPEED_VOLUME']]);
});

test('StudyDAO.byCentrelineTotal()', async () => {
  // invalid feature
  let features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(0);

  // centreline feature with no counts
  features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(0);

  // centreline feature with some counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(6);

  // centreline feature with lots of counts
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(3633);

  // centreline feature with more than one kind of count
  features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(3);
});
