import {
  CentrelineType,
  StudyRequestReason,
  StudyRequestStatus,
} from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import GeoJson from '@/lib/model/helpers/GeoJson';


const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.dateTime().required(),
  userId: Joi.number().integer().positive().required(),
  status: Joi.enum().ofType(StudyRequestStatus).required(),
  closed: Joi.boolean().required(),
};

const COLUMNS = {
  serviceRequestId: Joi.string().allow(null).required(),
  urgent: Joi.boolean().required(),
  urgentReason: Joi.string().allow(null).required(),
  assignedTo: Joi.string().allow(null).required(),
  dueDate: Joi.dateTime().required(),
  estimatedDeliveryDate: Joi.dateTime().required(),
  reasons: Joi.array().items(
    Joi.enum().ofType(StudyRequestReason).required(),
  ).required(),
  ccEmails: Joi.array().items(
    Joi.string().email({ tlds: false }),
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
