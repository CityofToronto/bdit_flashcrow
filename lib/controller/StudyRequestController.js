const Joi = require('@hapi/joi');

const StudyDAO = require('../db/StudyDAO');
const StudyRequestDAO = require('../db/StudyRequestDAO');
const StudyRequest = require('../model/StudyRequest');

const RoutesStudyRequest = [];

RoutesStudyRequest.push({
  method: 'POST',
  path: '/requests/study',
  options: {
    response: {
      schema: StudyRequest.persisted,
    },
    validate: {
      payload: StudyRequest.transient,
    },
  },
  handler: async (request) => {
    const { subject } = request.auth.credentials;
    const studyRequest = await StudyRequestDAO.create({
      userSubject: subject,
      status: 'REQUESTED',
      ...request.payload,
    });
    const studyPromises = studyRequest.studies.map(study => StudyDAO.create({
      userSubject: subject,
      studyRequestId: studyRequest.id,
      ...study,
    }));
    studyRequest.studies = await Promise.all(studyPromises);
    return studyRequest;
  },
});

RoutesStudyRequest.push({
  method: 'GET',
  path: '/requests/study',
  options: {
    response: {
      schema: Joi.array().items(StudyRequest.persisted),
    },
  },
  handler: async (request) => {
    // TODO: pagination
    // TODO: admin fetching for TSU
    const user = request.auth.credentials;
    const studyRequests = await StudyRequestDAO.byUser(user);
    const studies = await StudyDAO.byStudyRequests(studyRequests);
    return studyRequests.map((studyRequest) => {
      const { id } = studyRequest;
      const studiesForRequest = studies.filter(({ studyRequestId }) => studyRequestId === id);
      return {
        ...studyRequest,
        studies: studiesForRequest,
      };
    });
  },
});

module.exports = RoutesStudyRequest;
