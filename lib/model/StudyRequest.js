import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import GeoJson from '@/lib/model/helpers/GeoJson';
import { CentrelineType } from '@/lib/Constants';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.dateTime().required(),
  userSubject: Joi.string().required(),
  status: Joi.string().required(),
};

const COLUMNS = {
  serviceRequestId: Joi.string().allow(null).required(),
  priority: Joi.string().valid('STANDARD', 'URGENT').required(),
  dueDate: Joi.dateTime().required(),
  estimatedDeliveryDate: Joi.dateTime().required(),
  reasons: Joi.array().items(
    Joi.string().required(),
  ).required(),
  ccEmails: Joi.array().items(
    Joi.string().email(),
  ).required(),
  centrelineId: Joi.number().integer().positive().required(),
  centrelineType: Joi.number().valid(
    CentrelineType.INTERSECTION,
    CentrelineType.SEGMENT,
  ).required(),
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
  persistedUpdate: {
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
    studies: Joi.array().items(
      Joi.object(Study.persistedUpdate).required(),
    ).required(),
  },
  transient: {
    ...COLUMNS,
    studies: Joi.array().items(
      Joi.object(Study.transient).required(),
    ).required(),
  },
};
