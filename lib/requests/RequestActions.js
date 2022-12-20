import { AuthScope, StudyRequestStatus } from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';

class RequestActions {
  /* eslint-disable no-param-reassign */
  static actionAssignTo(studyRequest, assignedTo) {
    studyRequest.assignedTo = assignedTo;
    if (assignedTo === null) {
      studyRequest.status = StudyRequestStatus.REQUESTED;
    } else {
      studyRequest.status = StudyRequestStatus.ASSIGNED;
    }
  }

  static actionCancel(studyRequest) {
    studyRequest.status = StudyRequestStatus.CANCELLED;
  }

  static actionMarkCompleted(studyRequest) {
    studyRequest.status = StudyRequestStatus.COMPLETED;
  }

  static actionRejectData(studyRequest) {
    studyRequest.status = StudyRequestStatus.REJECTED;
  }

  static actionReopen(studyRequest) {
    studyRequest.status = StudyRequestStatus.REQUESTED;
  }

  static actionRequestChanges(studyRequest) {
    studyRequest.status = StudyRequestStatus.CHANGES_NEEDED;
  }
  /* eslint-enable no-param-reassign */

  static canAssignTo(user) {
    return hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN);
  }

  static canCancel(user, studyRequest) {
    if (!RequestActions.canEdit(user, studyRequest)) {
      return false;
    }
    const { status } = studyRequest;
    return status !== StudyRequestStatus.CANCELLED;
  }

  static canEdit(user) {
    if (hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) {
      return true;
    }
    if (hasAuthScope(user, AuthScope.STUDY_REQUESTS)) {
      return true;
    }
    return false;
  }

  static canMarkCompleted(user, studyRequest) {
    if (!RequestActions.canEdit(user, studyRequest)) {
      return false;
    }
    const { status } = studyRequest;
    return status !== StudyRequestStatus.COMPLETED;
  }

  static canRejectData(user, studyRequest) {
    if (!RequestActions.canEdit(user, studyRequest)) {
      return false;
    }
    const { status } = studyRequest;
    return status !== StudyRequestStatus.REJECTED;
  }

  static canReopen(user, studyRequest) {
    if (!RequestActions.canEdit(user, studyRequest)) {
      return false;
    }
    return studyRequest.status === StudyRequestStatus.CANCELLED;
  }

  static canRequestChanges(user, studyRequest) {
    if (!hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) {
      return false;
    }
    const { status } = studyRequest;
    return status !== StudyRequestStatus.CHANGES_NEEDED;
  }
}

export default RequestActions;
