import {
  CentrelineType,
  StudyHours,
  StudyRequestAssignee,
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
  // for the purposes of validatoin 2 week duration is normalized to a single week
  const normalizedDuration = duration === 336 ? duration / 2 : duration;
  if (k * 24 < normalizedDuration) {
    const n = normalizedDuration / 24;
    throw new Error(`Please select ${n} consecutive days or reduce study duration`);
  }
  return duration;
}

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive(),
  createdAt: Joi.dateTime(),
  userId: Joi.number().integer().positive(),
  studyRequestBulkId: Joi.number().integer().positive().allow(null),
  status: Joi.enum().ofType(StudyRequestStatus),
  assignedTo: Joi.enum().ofType(StudyRequestAssignee).allow(null),
};

const TRANSIENT_COLUMNS = {
  urgent: Joi.boolean(),
  urgentReason: Joi.string().when(
    'urgent',
    {
      is: true,
      otherwise: Joi.allow(null),
    },
  ),
  dueDate: Joi.dateTime(),
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
  studyTypeOther: Joi.string().allow(null),
  daysOfWeek: Joi.array().items(
    Joi
      .number()
      .integer()
      .min(0)
      .max(6)
      .required(),
  ),
  duration: Joi.number().integer().multiple(24).custom(validatorDurationConsecutiveDays)
    .allow(null),
  hours: Joi.enum().ofType(StudyHours).allow(null),
  notes: Joi.string().when(
    'hours',
    {
      is: Joi.valid(StudyHours.OTHER),
      otherwise: Joi.allow(''),
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
