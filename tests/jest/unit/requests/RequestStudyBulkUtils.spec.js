import { StudyRequestStatus } from '@/lib/Constants';
import { bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';

function expectBulkStatus(statuses, expected) {
  const studyRequests = statuses.map(status => ({ status }));
  expect(bulkStatus(studyRequests)).toBe(expected);
}

test('RequestStudyBulkUtils.bulkStatus', () => {
  expectBulkStatus([], null);
  expectBulkStatus([StudyRequestStatus.ASSIGNED], StudyRequestStatus.ASSIGNED);

  // take least-advanced status in "happy path"
  expectBulkStatus([
    StudyRequestStatus.ASSIGNED,
    StudyRequestStatus.COMPLETED,
  ], StudyRequestStatus.ASSIGNED);
  expectBulkStatus([
    StudyRequestStatus.COMPLETED,
    StudyRequestStatus.REQUESTED,
  ], StudyRequestStatus.REQUESTED);
  expectBulkStatus([
    StudyRequestStatus.COMPLETED,
    StudyRequestStatus.CHANGES_NEEDED,
    StudyRequestStatus.ASSIGNED,
    StudyRequestStatus.COMPLETED,
    StudyRequestStatus.ASSIGNED,
  ], StudyRequestStatus.CHANGES_NEEDED);

  // unless all requests are cancelled, ignore them for bulk status
  expectBulkStatus([
    StudyRequestStatus.CANCELLED,
    StudyRequestStatus.COMPLETED,
  ], StudyRequestStatus.COMPLETED);

  // unless all requests are rejected, ignore them for bulk status
  expectBulkStatus([
    StudyRequestStatus.COMPLETED,
    StudyRequestStatus.REJECTED,
    StudyRequestStatus.ASSIGNED,
  ], StudyRequestStatus.ASSIGNED);

  // unless all requests are cancelled or rejected, ignore them for bulk status
  expectBulkStatus([
    StudyRequestStatus.COMPLETED,
    StudyRequestStatus.REJECTED,
    StudyRequestStatus.COMPLETED,
    StudyRequestStatus.CANCELLED,
  ], StudyRequestStatus.COMPLETED);

  // if all requests are cancelled, bulk status is cancelled
  expectBulkStatus([
    StudyRequestStatus.CANCELLED,
    StudyRequestStatus.CANCELLED,
    StudyRequestStatus.CANCELLED,
  ], StudyRequestStatus.CANCELLED);

  // if all requests are rejected, bulk status is rejected
  expectBulkStatus([
    StudyRequestStatus.REJECTED,
    StudyRequestStatus.REJECTED,
    StudyRequestStatus.REJECTED,
  ], StudyRequestStatus.REJECTED);

  // if all requests are rejected or cancelled, bulk status is rejected
  expectBulkStatus([
    StudyRequestStatus.CANCELLED,
    StudyRequestStatus.REJECTED,
    StudyRequestStatus.CANCELLED,
  ], StudyRequestStatus.REJECTED);
});
