import {
  centrelineKey,
  LocationSelectionType,
  MAX_LOCATIONS,
  ReportExportMode,
  ReportFormat,
  ReportType,
  StudyType,
} from '@/lib/Constants';
import { setdefault } from '@/lib/MapUtils';
import Random from '@/lib/Random';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import CompositeId from '@/lib/io/CompositeId';
import StoragePath from '@/lib/io/storage/StoragePath';

afterAll(() => {
  db.$pool.end();
});

function generateLocationsSelection(locationsAll) {
  const k = Random.range(1, MAX_LOCATIONS + 1);
  const locations = Random.sample(locationsAll, k);
  return { locations, selectionType: LocationSelectionType.POINTS };
}

function generateReportFormat(reportType) {
  return Random.choice(reportType.formats);
}

function getCollisionReportTypes() {
  return ReportType.enumValues
    .filter(({ reportExportMode }) => reportExportMode === ReportExportMode.COLLISIONS);
}

function generateCollisionReportType() {
  return Random.choice(getCollisionReportTypes());
}

function getStudyReportTypes(studyType) {
  return studyType.reportTypes
    .filter(reportType => !Object.prototype.hasOwnProperty.call(reportType, 'options'));
}

function generateStudyReportType(studyType) {
  const reportTypes = getStudyReportTypes(studyType);
  return Random.choice(reportTypes);
}

test('StoragePath.forReport [collision fuzz test]', async () => {
  const sql = `
SELECT "centrelineId", "centrelineType"
FROM counts2.studies
WHERE "centrelineId" IS NOT NULL AND "centrelineType" IS NOT NULL
ORDER BY RANDOM() LIMIT 100`;
  const features = await db.manyOrNone(sql);
  let locationsAll = await CentrelineDAO.byFeatures(features);
  locationsAll = locationsAll.filter(location => location !== null);

  const n = 25;
  for (let i = 0; i < n; i++) {
    const locationsSelection = generateLocationsSelection(locationsAll);
    const { locations, selectionType } = locationsSelection;
    const s1 = CompositeId.encode(locations);
    const id = `${s1}/${selectionType.name}`;
    const type = generateCollisionReportType();
    const format = generateReportFormat(type);

    const report = { type, id, format };
    /* eslint-disable-next-line no-await-in-loop */
    const { namespace, key } = await StoragePath.forReport(report);
    expect(namespace).toEqual(StoragePath.NAMESPACE_REPORTS_COLLISION);
    expect(key.length).toBeLessThanOrEqual(220);
    expect(key).toMatch(/[A-Z0-9-]+/);
  }
});

test('StoragePath.forReport [study fuzz test]', async () => {
  const sql = `
SELECT "countGroupId", "studyType"
FROM counts2.studies
WHERE "centrelineId" IS NOT NULL AND "centrelineType" IS NOT NULL
ORDER BY RANDOM() LIMIT 100`;
  const rows = await db.manyOrNone(sql);

  const n = 25;
  for (let i = 0; i < n; i++) {
    const row = Random.choice(rows);
    const { countGroupId, studyType: studyTypeName } = row;
    const id = `${studyTypeName}/${countGroupId}`;
    const studyType = StudyType.enumValueOf(studyTypeName);
    const type = generateStudyReportType(studyType);
    const format = generateReportFormat(type);

    const report = { type, id, format };
    /* eslint-disable-next-line no-await-in-loop */
    const { namespace, key } = await StoragePath.forReport(report);
    expect(namespace).toEqual(StoragePath.NAMESPACE_REPORTS_STUDY);
    expect(key.length).toBeLessThanOrEqual(220);
    expect(key).toMatch(/[A-Z0-9-]+/);
  }
});

test('StoragePath.forReportZip [collision fuzz test]', async () => {
  const sql = `
SELECT "centrelineId", "centrelineType"
FROM counts2.studies
WHERE "centrelineId" IS NOT NULL AND "centrelineType" IS NOT NULL
ORDER BY RANDOM() LIMIT 100`;
  const features = await db.manyOrNone(sql);
  let locationsAll = await CentrelineDAO.byFeatures(features);
  locationsAll = locationsAll.filter(location => location !== null);

  const n = 25;
  for (let i = 0; i < n; i++) {
    const locationsSelection = generateLocationsSelection(locationsAll);
    const { locations, selectionType } = locationsSelection;
    const s1 = CompositeId.encode(locations);
    const id = `${s1}/${selectionType.name}`;
    const type = generateCollisionReportType();

    const reports = getCollisionReportTypes()
      .map(format => ({ type, id, format }));
    const reportTasks = reports.map(StoragePath.forReport);
    /* eslint-disable-next-line no-await-in-loop */
    const storagePaths = await Promise.all(reportTasks);

    const data = {
      reportExportMode: ReportExportMode.COLLISIONS,
      reports,
      s1,
      selectionType,
    };
    /* eslint-disable-next-line no-await-in-loop */
    const { namespace, key } = await StoragePath.forReportZip(data, storagePaths);
    expect(namespace).toEqual(StoragePath.NAMESPACE_REPORTS_COLLISION);
    expect(key).toMatch(/[A-Z0-9-]+/);
    storagePaths.forEach(({ key: reportKey }) => {
      expect(key.length + reportKey.length).toBeLessThanOrEqual(220);
    });
  }
});

test('StoragePath.forReportZip [study fuzz test]', async () => {
  const sql = `
SELECT "centrelineId", "centrelineType", "countGroupId", "studyType"
FROM counts2.studies
WHERE "centrelineId" IS NOT NULL AND "centrelineType" IS NOT NULL
ORDER BY RANDOM() LIMIT 100`;
  const rows = await db.manyOrNone(sql);
  const studiesByFeature = new Map();
  const features = new Set();
  rows.forEach(({
    centrelineId,
    centrelineType,
    countGroupId,
    studyType: studyTypeName,
  }) => {
    const study = { countGroupId, studyTypeName };
    const feature = { centrelineId, centrelineType };

    const key = centrelineKey(feature);
    const studies = setdefault(studiesByFeature, key, []);
    studies.push(study);
    features.add(feature);
  });
  let locationsAll = await CentrelineDAO.byFeatures(Array.from(features));
  locationsAll = locationsAll.filter(location => location !== null);

  const n = 10;
  for (let i = 0; i < n; i++) {
    const locationsSelection = generateLocationsSelection(locationsAll);
    const { locations, selectionType } = locationsSelection;
    const s1 = CompositeId.encode(locations);

    const reports = [];
    locations.forEach((location) => {
      const key = centrelineKey(location);
      const studies = studiesByFeature.get(key);
      const { countGroupId, studyTypeName } = Random.choice(studies);
      const id = `${studyTypeName}/${countGroupId}`;
      const studyType = StudyType.enumValueOf(studyTypeName);
      const types = getStudyReportTypes(studyType);
      types.forEach((type) => {
        const report = { type, id, format: ReportFormat.PDF };
        reports.push(report);
      });
    });
    const reportTasks = reports.map(StoragePath.forReport);
    /* eslint-disable-next-line no-await-in-loop */
    const storagePaths = await Promise.all(reportTasks);

    const data = {
      reportExportMode: ReportExportMode.STUDIES,
      reports,
      s1,
      selectionType,
    };
    /* eslint-disable-next-line no-await-in-loop */
    const { namespace, key } = await StoragePath.forReportZip(data, storagePaths);
    expect(namespace).toEqual(StoragePath.NAMESPACE_REPORTS_STUDY);
    expect(key).toMatch(/[A-Z0-9-]+/);
    storagePaths.forEach(({ key: reportKey }) => {
      expect(key.length + reportKey.length).toBeLessThanOrEqual(220);
    });
  }
});
