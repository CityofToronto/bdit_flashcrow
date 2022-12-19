import SrStatusTransitionValidator from '@/lib/SrStatusTransitionValidator';
import { StudyRequestStatus, AuthScope } from '@/lib/Constants';

describe('SrStatusTransitionValidator', () => {
  const srs = StudyRequestStatus;
  let authScopes = [];

  function getValidator() {
    return new SrStatusTransitionValidator(authScopes);
  }

  function getValidTransitions(currentStatus) {
    return getValidator().validTransitions(currentStatus);
  }

  function getIsValidTransition(oldStatus, newStatus) {
    return getValidator().isValidTransition(oldStatus, newStatus);
  }

  describe('for users with STUDY_REQUEST_ADMIN scope', () => {
    beforeAll(() => {
      authScopes = [AuthScope.STUDY_REQUESTS_ADMIN, AuthScope.ADMIN];
    });

    describe('#validTransitions returns which statuses are available from the current one...', () => {
      test('REQUESTED', () => {
        expect(getValidTransitions(srs.REQUESTED)).toEqual(
          [srs.ASSIGNED, srs.CANCELLED, srs.CHANGES_NEEDED],
        );
      });

      test('ASSIGNED', () => {
        expect(getValidTransitions(srs.ASSIGNED)).toEqual(
          [srs.COMPLETED, srs.CANCELLED, srs.CHANGES_NEEDED, srs.REJECTED],
        );
      });

      test('CANCELLED', () => {
        expect(getValidTransitions(srs.COMPLETED)).toEqual([]);
      });

      test('COMPLETED', () => {
        expect(getValidTransitions(srs.COMPLETED)).toEqual([]);
      });

      test('REJECTED', () => {
        expect(getValidTransitions(srs.REJECTED)).toEqual([srs.ASSIGNED, srs.COMPLETED]);
      });

      test('CHANGES_NEEDED', () => {
        expect(getValidTransitions(srs.CHANGES_NEEDED)).toEqual(
          [srs.REQUESTED, srs.ASSIGNED, srs.CANCELLED],
        );
      });
    });

    describe('#isValidTransition returns', () => {
      test('true when old to new status is allowed', () => {
        expect(getIsValidTransition(srs.REQUESTED, srs.CANCELLED)).toEqual(true);
      });

      test('false when old to new status is NOT allowed', () => {
        expect(getIsValidTransition(srs.CHANGES_NEEDED, srs.REJECTED)).toEqual(false);
      });
    });
  });

  describe('for users with STUDY_REQUESTS scope', () => {
    beforeAll(() => {
      authScopes = [AuthScope.STUDY_REQUESTS, AuthScope.MVCR_READ];
    });

    describe('#validTransitions returns which statuses are available from the current one...', () => {
      test('REQUESTED', () => {
        expect(getValidTransitions(srs.REQUESTED)).toEqual([srs.CANCELLED]);
      });

      test('ASSIGNED', () => {
        expect(getValidTransitions(srs.ASSIGNED)).toEqual([]);
      });
    });

    describe('#isValidTransition returns', () => {
      test('true when old to new status is allowed', () => {
        expect(getIsValidTransition(srs.REQUESTED, srs.CANCELLED)).toEqual(true);
      });

      test('false when old to new status is NOT allowed', () => {
        expect(getIsValidTransition(srs.REQUESTED, srs.COMPLETED)).toEqual(false);
      });
    });
  });

  describe('for users without any kind of STUDY_REQUEST scope', () => {
    beforeAll(() => {
      authScopes = [AuthScope.MVCR_READ];
    });

    describe('#validTransitions returns a blank for all current statuses...', () => {
      test('REQUESTED', () => {
        expect(getValidTransitions(srs.REQUESTED)).toEqual([]);
      });

      test('ASSIGNED', () => {
        expect(getValidTransitions(srs.ASSIGNED)).toEqual([]);
      });
    });

    describe('#isValidTransition returns', () => {
      test('false regardless of old and new status', () => {
        expect(getIsValidTransition(srs.REQUESTED, srs.CANCELLED)).toEqual(false);
      });
    });
  });
});
