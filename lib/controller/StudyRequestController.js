const Joi = require('@hapi/joi');

const StudyDAO = require('../db/StudyDAO');
const StudyRequestDAO = require('../db/StudyRequestDAO');
const EmailStudyRequestConfirmation = require('../email/EmailStudyRequestConfirmation');
const Mailer = require('../email/Mailer');
const LogTag = require('../log/LogTag');
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
    const user = request.auth.credentials;
    const { subject } = user;
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
    const email = new EmailStudyRequestConfirmation(user, studyRequest);
    const emailOptions = await email.getOptions();
    const emailResponse = await Mailer.send(emailOptions);
    request.log(LogTag.DEBUG, emailResponse);
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
