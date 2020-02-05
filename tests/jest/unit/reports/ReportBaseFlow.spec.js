import { StudyType } from '@/lib/Constants';
import CountDAO from '@/lib/db/CountDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ReportSpeedPercentile from '@/lib/reports/ReportSpeedPercentile';

jest.mock('@/lib/db/CountDAO');

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

  CountDAO.byIdAndCategory.mockResolvedValue(null);
  rawId = '5/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  let count = {
    type: { studyType: StudyType.TMC },
  };
  CountDAO.byIdAndCategory.mockResolvedValue(count);
  rawId = '5/17';
  await expect(reportInstance.parseId(rawId)).rejects.toThrow(InvalidReportIdError);

  count = {
    type: { studyType: StudyType.ATR_SPEED_VOLUME },
  };
  CountDAO.byIdAndCategory.mockResolvedValue(count);
  rawId = '4/17';
  await expect(reportInstance.parseId(rawId)).resolves.toEqual(count);
});
