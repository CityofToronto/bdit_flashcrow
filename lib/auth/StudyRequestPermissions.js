import Boom from '@hapi/boom';

import { AuthScope } from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';
import SrStatusTransitionValidator from '@/lib/SrStatusTransitionValidator';

/**
 * Checks the details of a study request to ensure that we're not trying to update
 * non-updatable columns.  Works for both bulk and non-bulk requests.
 *
 * @param {Object} studyRequestNew - new study request object, usually as passed in the payload
 * of a `PUT` request
 * @param {Object} studyRequestOld - old study request object, usually as fetched using
 * {@link StudyRequestDAO.byId}
 * @returns {hapi.Boom?} `Boom` error if the update cannot proceed, or `null` if it can
 */
function canUpdateStudyRequestDetails(studyRequestNew, studyRequestOld, user) {
  if (studyRequestNew.id !== studyRequestOld.id) {
    return Boom.badRequest('cannot change ID for study request');
  }
  if (!studyRequestNew.createdAt.equals(studyRequestOld.createdAt)) {
    return Boom.badRequest('cannot change creation timestamp for study request');
  }

  if (!hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) {
    if (studyRequestOld.userId !== user.id) {
      return Boom.forbidden('not authorized to change study request owned by another user');
    }
    if (studyRequestNew.userId !== studyRequestOld.userId) {
      return Boom.forbidden('not authorized to change owner for study request');
    }
  }
  return null;
}

/**
 *
 * @param {Object} studyRequestNew - new study request object, usually as passed in the payload
 * of a `PUT` request
 * @param {Object} studyRequestOld - old study request object, usually as fetched using
 * {@link StudyRequestDAO.byId}
 * @param {Object} user - user making the update
 * @returns {hapi.Boom?} `Boom` error if the update cannot proceed, or `null` if it can
 */
function canUpdateStudyRequest(studyRequestNew, studyRequestOld, user) {
  const err = canUpdateStudyRequestDetails(studyRequestNew, studyRequestOld, user);
  if (err !== null) {
    return err;
  }

  if (studyRequestNew.studyBulkRequestId !== studyRequestOld.studyBulkRequestId) {
    return Boom.badRequest('cannot change bulk request ID for study request');
  }

  const srsTransitionValidator = new SrStatusTransitionValidator(user.scope);
  const isValidStatusTransition = srsTransitionValidator.isValidTransition(
    studyRequestOld.status, studyRequestNew.status,
  );
  if (studyRequestNew.status !== studyRequestOld.status && !isValidStatusTransition) {
    return Boom.forbidden('not authorized to change status for study request');
  }

  if (!hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) { // user is NOT SR_ADMIN
    if (studyRequestNew.assignedTo !== studyRequestOld.assignedTo) {
      return Boom.forbidden('not authorized to change assignment for study request');
    }
    if (studyRequestNew.studyRequestBulkId !== studyRequestOld.studyRequestBulkId) {
      return Boom.forbidden('not authorized to change bulk request ID for study request');
    }
  }

  return null;
}

/**
 *
 * @param {Object} studyRequestBulkNew - new bulk study request object, usually as passed in
 * the payload of a `PUT` request
 * @param {Object} studyRequestBulkOld - old bulk study request object, usually as fetched using
 * {@link StudyRequestBulkDAO.byId}
 * @param {Object} user - user making the update
 * @returns {hapi.Boom?} `Boom` error if the update cannot proceed, or `null` if it can
 */
function canUpdateStudyRequestBulk(studyRequestBulkNew, studyRequestBulkOld, user) {
  let err = canUpdateStudyRequestDetails(studyRequestBulkNew, studyRequestBulkOld, user);
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

  return null;
}

/**
 * @namespace
 */
const StudyRequestPermissions = {
  canUpdateStudyRequest,
  canUpdateStudyRequestBulk,
};

export {
  StudyRequestPermissions as default,
  canUpdateStudyRequest,
  canUpdateStudyRequestBulk,
};
