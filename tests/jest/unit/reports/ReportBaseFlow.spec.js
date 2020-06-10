import { StudyType } from '@/lib/Constants';
import StudyDAO from '@/lib/db/StudyDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ReportSpeedPercentile from '@/lib/reports/ReportSpeedPercentile';

jest.mock('@/lib/db/StudyDAO');

test('ReportBaseFlow#parseId', async () => {
  const reportInstance = new ReportSpeedPercentile();
  let rawId;

  rawId = '';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  rawId = '42';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  rawId = 'foo/bar';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  rawId = '6/bar';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(null);
  rawId = '5/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  let study = {
    type: { studyType: StudyType.TMC },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(study);
  rawId = '5/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  study = {
    type: { studyType: StudyType.ATR_SPEED_VOLUME },
  };
  StudyDAO.byCategoryAndCountGroup.mockResolvedValue(study);
  rawId = '4/17';
  await expect(reportInstance.parseId(rawId)).resolves.toEqual(study);
});
