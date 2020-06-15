/* eslint-disable camelcase */
import path from 'path';

import {
  ReportFormat,
  ReportType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import StudyDAO from '@/lib/db/StudyDAO';
import StudyDataDAO from '@/lib/db/StudyDataDAO';
import ReportFactory from '@/lib/reports/ReportFactory';
import MovePdfGenerator from '@/lib/reports/format/MovePdfGenerator';
import { loadJsonSync } from '@/lib/test/TestDataLoader';

jest.mock('@/lib/db/StudyDAO');
jest.mock('@/lib/db/StudyDataDAO');

const countData_5_36781 = loadJsonSync(
  path.resolve(__dirname, '../data/countData_5_36781.json'),
);

beforeAll(MovePdfGenerator.init);

function getNumPages(doc) {
  const range = doc.bufferedPageRange();
  return range.start + range.count;
}

test('COUNT_SUMMARY_TURNING_MOVEMENT', async () => {
  const study = {
    countGroupId: 36781,
    type: { id: 5, studyType: StudyType.TMC },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(study);

  const counts = [{
    hours: StudyHours.SCHOOL,
    id: 36781,
    locationDesc: 'GERRARD ST AT SUMACH ST (PX 1390)',
  }];
  const studyData = new Map([[36781, countData_5_36781]]);
  StudyDataDAO.byStudy.mockResolvedValue({ counts, studyData });

  const reportInstance = ReportFactory.getInstance(ReportType.COUNT_SUMMARY_TURNING_MOVEMENT);
  const doc = await reportInstance.generate('5/36781', ReportFormat.PDF, {});
  expect(getNumPages(doc)).toBe(1);
});
