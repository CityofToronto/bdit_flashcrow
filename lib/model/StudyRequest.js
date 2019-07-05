const Joi = require('@hapi/joi');

const GeoJson = require('./helpers/GeoJson');
const Study = require('./Study');

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.date().max('now').required(),
  userSubject: Joi.string().required(),
  status: Joi.string().required(),
};

const COLUMNS = {
  serviceRequestId: Joi.string().allow(null).required(),
  priority: Joi.string().valid('STANDARD', 'URGENT').required(),
  dueDate: Joi.date().min('now').required(),
  estimatedDeliveryDate: Joi.date().min('now').required(),
  reasons: Joi.array().items(
    Joi.string().required(),
  ).required(),
  ccEmails: Joi.array().items(
    Joi.string().email(),
  ).required(),
  centrelineId: Joi.number().integer().positive().required(),
  // TODO: DRY with Constants.CentrelineType
  centrelineType: Joi.number().valid(1, 2).required(),
  geom: GeoJson.Point,
};

module.exports = {
  persisted: {
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
    studies: Joi.array().items(
      Joi.object(Study.persisted).required(),
    ).required(),
  },
  transient: {
    ...COLUMNS,
    studies: Joi.array().items(
      Joi.object(Study.transient).required(),
    ).required(),
  },
};
