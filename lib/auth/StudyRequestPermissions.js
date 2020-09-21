import Boom from '@hapi/boom';

import { AuthScope, StudyRequestStatus } from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';

function canUpdateStudyRequestDetails(studyRequestNew, studyRequestOld) {
  if (studyRequestNew.id !== studyRequestOld.id) {
    return Boom.badRequest('cannot change ID for study request');
  }
  if (!studyRequestNew.createdAt.equals(studyRequestOld.createdAt)) {
    return Boom.badRequest('cannot change creation timestamp for study request');
  }
  if (studyRequestNew.userId !== studyRequestOld.userId) {
    return Boom.badRequest('cannot change owner for study request');
  }
  if (studyRequestNew.lastEditorId !== studyRequestOld.lastEditorId) {
    return Boom.badRequest('cannot change last editor for study request');
  }
  if (studyRequestNew.lastEditedAt === null) {
    if (studyRequestOld.lastEditedAt !== null) {
      return Boom.badRequest('cannot change last edit timestamp for study request');
    }
  } else if (!studyRequestNew.lastEditedAt.equals(studyRequestOld.lastEditedAt)) {
    return Boom.badRequest('cannot change last edit timestamp for study request');
  }
  return null;
}

function canUpdateStudyRequest(studyRequestNew, studyRequestOld, user) {
  const err = canUpdateStudyRequestDetails(studyRequestNew, studyRequestOld);
  if (err !== null) {
    return err;
  }

  if (studyRequestNew.status !== studyRequestOld.status
    && !studyRequestOld.status.canTransitionTo(studyRequestNew.status)) {
    return Boom.badRequest(
      `invalid state transition: ${studyRequestOld.status} -> ${studyRequestNew.status}`,
    );
  }

  if (!hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) {
    if (studyRequestOld.userId !== user.id) {
      return Boom.forbidden('not authorized to change study request owned by another user');
    }
    if (studyRequestNew.assignedTo !== studyRequestOld.assignedTo) {
      return Boom.forbidden('not authorized to change assignment for study request');
    }
    if (studyRequestNew.status !== studyRequestOld.status
      && studyRequestNew.status !== StudyRequestStatus.CANCELLED
      && studyRequestOld.status !== StudyRequestStatus.CANCELLED) {
      /*
       * Non-admin requesters can only change the status to cancel requests, or to
       * reopen previously cancelled requests.
       */
      return Boom.forbidden('not authorized to change status for study request');
    }
  }

  return null;
}

function canUpdateStudyRequestBulk(studyRequestBulkNew, studyRequestBulkOld, user) {
  let err = canUpdateStudyRequestDetails(studyRequestBulkNew, studyRequestBulkOld);
  if (err !== null) {
    return err;
  }

  const n = studyRequestBulkNew.studyRequests.length;
  if (n !== studyRequestBulkOld.studyRequests.length) {
    return Boom.badRequest('cannot add / remove requests for bulk study request');
  }

  for (let i = 0; i < n; i++) {
    const studyRequestNew = studyRequestBulkNew.studyRequests[i];
    const studyRequestOld = studyRequestBulkOld.studyRequests[i];
    err = canUpdateStudyRequest(studyRequestNew, studyRequestOld, user);
    if (err !== null) {
      return err;
    }
  }

  if (!hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) {
    if (studyRequestBulkOld.userId !== user.id) {
      return Boom.forbidden('not authorized to change study request owned by another user');
    }
  }

  return null;
}

const StudyRequestPermissions = {
  canUpdateStudyRequest,
  canUpdateStudyRequestBulk,
};

export {
  StudyRequestPermissions as default,
  canUpdateStudyRequest,
  canUpdateStudyRequestBulk,
};
