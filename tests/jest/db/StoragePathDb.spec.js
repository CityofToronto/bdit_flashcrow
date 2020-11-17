import {
  LocationSelectionType,
  MAX_LOCATIONS,
  ReportExportMode,
  ReportType,
} from '@/lib/Constants';
import Random from '@/lib/Random';
import db from '@/lib/db/db';
import CategoryDAO from '@/lib/db/CategoryDAO';
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

function generateCollisionReportType() {
  const reportTypes = ReportType.enumValues
    .filter(({ reportExportMode }) => reportExportMode === ReportExportMode.COLLISIONS);
  return Random.choice(reportTypes);
}

function generateStudyReportType(studyType) {
  const reportTypes = studyType.reportTypes
    .filter(reportType => !Object.prototype.hasOwnProperty.call(reportType, 'options'));
  return Random.choice(reportTypes);
}

test('StoragePath.forReport [collision fuzz test]', async () => {
  const sql = `
SELECT centreline_id, centreline_type
FROM counts.studies TABLESAMPLE BERNOULLI (1)`;
  const rows = await db.manyOrNone(sql);
  const features = rows.map(({ centreline_id: centrelineId, centreline_type: centrelineType }) => ({
    centrelineId,
    centrelineType,
  }));
  const locationsAll = await CentrelineDAO.byFeatures(features);

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
    expect(key.length).toBeLessThan(200);
    expect(key).toMatch(/[A-Z0-9-]+/);
  }
});

test('StoragePath.forReport [study fuzz test]', async () => {
  const categories = await CategoryDAO.all();

  const sql = `
SELECT "CATEGORY_ID", count_group_id
FROM counts.studies TABLESAMPLE BERNOULLI (1)`;
  const rows = await db.manyOrNone(sql);

  const n = rows.length;
  for (let i = 0; i < n; i++) {
    const { CATEGORY_ID: categoryId, count_group_id: countGroupId } = rows[i];
    const id = `${categoryId}/${countGroupId}`;
    const { studyType } = categories.get(categoryId);
    if (studyType === null) {
      /* eslint-disable-next-line no-continue */
      continue;
    }
    const type = generateStudyReportType(studyType);
    const format = generateReportFormat(type);

    const report = { type, id, format };
    /* eslint-disable-next-line no-await-in-loop */
    const { namespace, key } = await StoragePath.forReport(report);
    expect(namespace).toEqual(StoragePath.NAMESPACE_REPORTS_STUDY);
    expect(key.length).toBeLessThan(200);
    expect(key).toMatch(/[A-Z0-9-]+/);
  }
});
