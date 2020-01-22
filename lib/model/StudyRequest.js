import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import GeoJson from '@/lib/model/helpers/GeoJson';
import { CentrelineType } from '@/lib/Constants';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.dateTime().required(),
  userId: Joi.number().integer().positive().required(),
  status: Joi.string().required(),
  closed: Joi.boolean().required(),
};

const COLUMNS = {
  serviceRequestId: Joi.string().allow(null).required(),
  priority: Joi.string().valid('STANDARD', 'URGENT').required(),
  assignedTo: Joi.string().allow(null).required(),
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
  read: Joi.object().keys({
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
    studies: Joi.array().items(
      Study.read.required(),
    ).required(),
  }),
  update: Joi.object().keys({
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
    studies: Joi.array().items(
      Study.update.required(),
    ).required(),
  }),
  create: Joi.object().keys({
    ...COLUMNS,
    studies: Joi.array().items(
      Study.create.required(),
    ).required(),
  }),
};
