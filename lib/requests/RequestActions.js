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
    studyRequest.closed = false;
  }

  static actionCancel(studyRequest) {
    studyRequest.status = StudyRequestStatus.CANCELLED;
    studyRequest.closed = true;
  }

  static actionMarkCompleted(studyRequest) {
    studyRequest.status = StudyRequestStatus.COMPLETED;
    studyRequest.closed = true;
  }

  static actionRejectData(studyRequest) {
    studyRequest.status = StudyRequestStatus.REJECTED;
    studyRequest.closed = false;
  }

  static actionReopen(studyRequest) {
    studyRequest.status = StudyRequestStatus.REQUESTED;
    studyRequest.closed = false;
  }

  static actionRequestChanges(studyRequest) {
    studyRequest.status = StudyRequestStatus.CHANGES_NEEDED;
    studyRequest.closed = false;
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

  static canEdit(user, studyRequest) {
    if (hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) {
      return true;
    }
    if (hasAuthScope(user, AuthScope.STUDY_REQUESTS)) {
      return user.id === studyRequest.userId;
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
