import { CentrelineType, StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyDAO from '@/lib/db/StudyDAO';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import StudyFilters from '@/lib/model/StudyFilters';
import {
  toMatchNumPerStudyType,
  toMatchNumPerStudyTypeAndLocation,
} from '@/lib/test/ExpectMatchers';
import DateTime from '@/lib/time/DateTime';

expect.extend({
  toMatchNumPerStudyType,
  toMatchNumPerStudyTypeAndLocation,
});

afterAll(() => {
  db.$pool.end();
});

test('StudyDAO.byCentreline [invalid feature]', async () => {
  const features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    studyTypes: [StudyType.TMC],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(0);
});

test('StudyDAO.byCentreline [invalid date range]', async () => {
  const features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 12, day: 31 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    studyTypes: [StudyType.TMC],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(0);
});

test('StudyDAO.byCentreline [valid feature, fewer than limit]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  await expect(
    Joi.array().items(Study.read).validateAsync(studies),
  ).resolves.toEqual(studies);
  expect(studies.length).toBeGreaterThan(0);
  studies.forEach((study) => {
    expect(study.duration % 24).toEqual(0);
    expect(study.hours).toBeNull();
  });
});

test('StudyDAO.byCentreline [valid feature, date range filters to empty]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2019, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(0);
});

test('StudyDAO.byCentreline [valid feature, more than limit]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    studyTypes: [StudyType.RESCU],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(10);
});

test('StudyDAO.byCentreline [valid feature, date range filters to less]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2015, month: 4, day: 15 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 4, day: 1 }),
    studyTypes: [StudyType.RESCU],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 10, offset: 0 });
  expect(studies).toHaveLength(8);
});

test('StudyDAO.byCentreline [pagination]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 1, day: 1 }),
    studyTypes: [StudyType.RESCU],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  const { n } = studySummary[0];
  for (let offset = 0; offset < n; offset += 100) {
    /* eslint-disable-next-line no-await-in-loop */
    const studies = await StudyDAO.byCentreline(features, studyQuery, { limit: 100, offset });
    const expectedLength = Math.min(100, n - offset);
    expect(studies).toHaveLength(expectedLength);
  }
});

test('StudyDAO.byCentrelineSummary [invalid feature]', async () => {
  const features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    studyTypes: [StudyType.TMC],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyType([]);
});

test('StudyDAO.byCentrelineSummary [invalid date range]', async () => {
  const features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 12, day: 31 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    studyTypes: [StudyType.TMC],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyType([]);
});

test('StudyDAO.byCentrelineSummary [valid feature, no studies]', async () => {
  const features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {};
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyType([]);
});

test('StudyDAO.byCentrelineSummary [valid feature, some studies]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {};
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  const studySummarySchema = Joi.array().items(
    Joi.object().keys({
      mostRecent: Study.read,
      n: Joi.number().integer().positive().required(),
      studyType: Joi.enum().ofType(StudyType).required(),
    }),
  );
  expect(studySummary).toMatchNumPerStudyType([[2, 'ATR_SPEED_VOLUME'], [4, 'ATR_VOLUME']]);
  await expect(
    studySummarySchema.validateAsync(studySummary),
  ).resolves.toEqual(studySummary);
});

test('StudyDAO.byCentrelineSummary [valid feature, date range filters to empty]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2019, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyType([]);
});

test('StudyDAO.byCentrelineSummary [valid feature, lots of studies]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {};
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyType([[3, 'ATR_VOLUME'], [3633, 'RESCU'], [2, 'TMC']]);
});

test('StudyDAO.byCentrelineSummary [valid feature, lots of studies, date range filters to empty]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 1980, month: 1, day: 2 }),
    dateRangeStart: DateTime.fromObject({ year: 1980, month: 1, day: 1 }),
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyType([]);
});

test('StudyDAO.byCentrelineSummary [valid feature, lots of studies, date range filters to less]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2016, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 1, day: 1 }),
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyType([[187, 'RESCU']]);
});

test('StudyDAO.byCentrelineSummary [valid feature, multiple study types]', async () => {
  const features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {};
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyType([[2, 'ATR_SPEED_VOLUME'], [1, 'ATR_VOLUME']]);
});

test('StudyDAO.byCentrelineSummaryPerLocation [invalid feature]', async () => {
  // invalid feature
  const features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    studyTypes: [StudyType.TMC],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyTypeAndLocation([]);
});

test('StudyDAO.byCentrelineSummaryPerLocation [invalid date range]', async () => {
  // invalid date range (start > end)
  const features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2017, month: 12, day: 31 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
    studyTypes: [StudyType.TMC],
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyTypeAndLocation([]);
});

test('StudyDAO.byCentrelineSummaryPerLocation [valid feature, no studies]', async () => {
  const features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {};
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyTypeAndLocation([]);
});

test('StudyDAO.byCentrelineSummaryPerLocation [valid feature, some studies]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {};
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  const studySummaryPerLocationSchema = Joi.array().items(
    Joi.object().keys({
      perLocation: Joi.array().items(
        Joi.object().keys({
          mostRecent: Study.read.allow(null),
          n: Joi.number().integer().min(0).required(),
        }),
      ),
      studyType: Joi.enum().ofType(StudyType).required(),
    }),
  );
  expect(studySummary).toMatchNumPerStudyTypeAndLocation(
    [[[2], 'ATR_SPEED_VOLUME'], [[4], 'ATR_VOLUME']],
  );
  await expect(
    studySummaryPerLocationSchema.validateAsync(studySummary),
  ).resolves.toEqual(studySummary);
});

test('StudyDAO.byCentrelineSummaryPerLocation [valid feature, some studies, date range filters to empty]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2019, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2018, month: 1, day: 1 }),
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyTypeAndLocation([]);
});

test('StudyDAO.byCentrelineSummaryPerLocation [valid feature, lots of studies]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {};
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyTypeAndLocation([[[3], 'ATR_VOLUME'], [[3633], 'RESCU'], [[2], 'TMC']]);
});

test('StudyDAO.byCentrelineSummaryPerLocation [valid feature, lots of studies, date range filters to empty]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 1980, month: 1, day: 2 }),
    dateRangeStart: DateTime.fromObject({ year: 1980, month: 1, day: 1 }),
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyTypeAndLocation([]);
});

test('StudyDAO.byCentrelineSummaryPerLocation [valid feature, lots of studies, date range filters to less]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {
    dateRangeEnd: DateTime.fromObject({ year: 2016, month: 1, day: 1 }),
    dateRangeStart: DateTime.fromObject({ year: 2015, month: 1, day: 1 }),
  };
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyTypeAndLocation([[[187], 'RESCU']]);
});

test('StudyDAO.byCentrelineSummaryPerLocation [valid feature, multiple study types]', async () => {
  const features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  let studyQuery = {};
  studyQuery = await Joi.object().keys(StudyFilters).validateAsync(studyQuery);
  const studySummary = await StudyDAO.byCentrelineSummaryPerLocation(features, studyQuery);
  expect(studySummary).toMatchNumPerStudyTypeAndLocation([[[2], 'ATR_SPEED_VOLUME'], [[1], 'ATR_VOLUME']]);
});

test('StudyDAO.byCentrelineTotal [invalid feature]', async () => {
  const features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  const total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(0);
});

test('StudyDAO.byCentrelineTotal [valid feature, no studies]', async () => {
  const features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  const total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(0);
});

test('StudyDAO.byCentrelineTotal [valid feature, some studies]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(6);
});

test('StudyDAO.byCentrelineTotal [valid feature, lots of studies]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBeGreaterThanOrEqual(3635);
});

test('StudyDAO.byCentrelineTotal [valid feature, multiple study types]', async () => {
  const features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  const total = await StudyDAO.byCentrelineTotal(features);
  expect(total).toBe(3);
});
