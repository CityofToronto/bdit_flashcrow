import {
  CentrelineType,
  StudyHours,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';
import GeoJson from '@/lib/model/helpers/GeoJson';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive(),
  createdAt: Joi.dateTime(),
  userId: Joi.number().integer().positive(),
  status: Joi.enum().ofType(StudyRequestStatus),
  closed: Joi.boolean(),
  lastEditorId: Joi.number().integer().positive().allow(null),
  lastEditedAt: Joi.dateTime().allow(null),
};

const TRANSIENT_COLUMNS = {
  serviceRequestId: Joi.string().allow(null),
  urgent: Joi.boolean(),
  urgentReason: Joi.string().allow(null),
  assignedTo: Joi.string().allow(null),
  dueDate: Joi.dateTime(),
  estimatedDeliveryDate: Joi.dateTime(),
  reasons: Joi.array().items(
    Joi.enum().ofType(StudyRequestReason),
  ),
  ccEmails: Joi.array().items(
    Joi.string().email({ tlds: false }),
  ),
  centrelineId: Joi.number().integer().positive(),
  centrelineType: Joi.number().valid(
    CentrelineType.INTERSECTION,
    CentrelineType.SEGMENT,
  ),
  geom: GeoJson.Point,
  studyType: Joi.enum().ofType(StudyType),
  daysOfWeek: Joi.array().items(
    Joi.number().integer().min(0).max(6),
  ),
  duration: Joi.number().integer().multiple(24).allow(null),
  hours: Joi.enum().ofType(StudyHours).allow(null),
  notes: Joi.string().allow(''),
};

const StudyRequest = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default StudyRequest;
