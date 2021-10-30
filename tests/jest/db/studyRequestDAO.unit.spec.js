import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import db from '@/lib/db/db';

jest.mock('@/lib/db/db');
jest.mock('@/lib/db/StudyRequestItemDAO');

describe('update', () => {
  const studyRequest = { id: 1, studyType: 'TMC', studyRequestBulkId: null };

  beforeAll(async () => {
    db.query.mockResolvedValue(true);
  });

  beforeEach(async () => {
    StudyRequestDAO.update(studyRequest);
  });

  test('updates the Study Request Item corresponding to the Study Request', () => {
    expect(StudyRequestItemDAO.upsertByStudyRequestIds).toHaveBeenCalledWith([1]);
  });

  describe('when the Study Request belongs to a project', () => {
    beforeAll(async () => {
      studyRequest.studyRequestBulkId = 2;
    });

    test('updates the Study Request Item corresponding to the Project', () => {
      expect(StudyRequestItemDAO.upsertByStudyRequestBulkIds).toHaveBeenCalledWith([2]);
    });
  });
});
