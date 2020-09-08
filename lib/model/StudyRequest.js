import {
  CentrelineType,
  StudyHours,
  StudyRequestAssignee,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';
import { Point } from '@/lib/model/helpers/GeoJson';
import { numConsecutiveDaysOfWeek } from '@/lib/time/TimeUtils';

function validatorDurationConsecutiveDays(duration, helpers) {
  const [{ daysOfWeek }] = helpers.state.ancestors;
  const k = numConsecutiveDaysOfWeek(daysOfWeek);
  if (k * 24 >= duration) {
    return duration;
  }
  const n = duration / 24;
  throw new Error(`Please select ${n} consecutive days or reduce study duration`);
}

function validatorIsAutomatic(studyType) {
  if (studyType.automatic) {
    return studyType;
  }
  throw new Error('expected automatic study type');
}

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive(),
  createdAt: Joi.dateTime(),
  userId: Joi.number().integer().positive(),
  status: Joi.enum().ofType(StudyRequestStatus),
  closed: Joi.boolean(),
  lastEditorId: Joi.number().integer().positive().allow(null),
  lastEditedAt: Joi.dateTime().allow(null),
  assignedTo: Joi.enum().ofType(StudyRequestAssignee).allow(null),
};

const TRANSIENT_COLUMNS = {
  serviceRequestId: Joi.string().allow(null),
  urgent: Joi.boolean(),
  urgentReason: Joi.string().when(
    'urgent',
    {
      is: true,
      otherwise: Joi.allow(null),
    },
  ),
  dueDate: Joi.dateTime(),
  estimatedDeliveryDate: Joi.dateTime(),
  reason: Joi.enum().ofType(StudyRequestReason),
  ccEmails: Joi.array().items(
    Joi.string().email({ tlds: false }).pattern(/@toronto\.ca$/),
  ).when(
    'urgent',
    {
      is: true,
      then: Joi.array().min(1),
    },
  ),
  studyType: Joi.enum().ofType(StudyType),
  daysOfWeek: Joi.array().items(
    Joi
      .number()
      .integer()
      .min(0)
      .max(6)
      .required(),
  ),
  duration: Joi.when(
    'studyType',
    {
      is: Joi.custom(validatorIsAutomatic),
      then: Joi.number().integer().multiple(24).custom(validatorDurationConsecutiveDays),
      otherwise: Joi.valid(null),
    },
  ),
  hours: Joi.when(
    'studyType',
    {
      is: Joi.custom(validatorIsAutomatic),
      then: Joi.valid(null),
      otherwise: Joi.enum().ofType(StudyHours),
    },
  ),
  notes: Joi.string().when(
    'hours',
    {
      is: Joi.valid(StudyHours.OTHER),
      otherwise: Joi.allow(null),
    },
  ),
  centrelineId: Joi.number().integer().positive(),
  centrelineType: Joi.number().valid(
    CentrelineType.INTERSECTION,
    CentrelineType.SEGMENT,
  ),
  geom: Point,
};

const StudyRequest = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default StudyRequest;
