import Joi from '@hapi/joi';

import GeoJson from './helpers/GeoJson';
import Study from './Study';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.date().max('now').required(),
  userSubject: Joi.string().required(),
  status: Joi.string().required(),
};

const COLUMNS = {
  serviceRequestId: Joi.string().allow(null).required(),
  priority: Joi.string().valid('STANDARD', 'URGENT').required(),
  dueDate: Joi.date().required(),
  estimatedDeliveryDate: Joi.date().required(),
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

export default {
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
