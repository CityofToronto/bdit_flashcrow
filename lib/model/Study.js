import { COUNT_TYPES, StudyHours } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.dateTime().required(),
  userId: Joi.number().integer().positive().required(),
  studyRequestId: Joi.number().integer().positive().required(),
};

const PERSISTED_COLUMNS_OPTIONAL = {
  id: Joi.number().integer().positive().optional(),
  createdAt: Joi.dateTime().optional(),
  userId: Joi.number().integer().positive().required(),
  studyRequestId: Joi.number().integer().positive().optional(),
};

const COLUMNS = {
  studyType: Joi.string().valid(...COUNT_TYPES.map(({ value }) => value)).required(),
  daysOfWeek: Joi.array().items(
    Joi
      .number()
      .integer()
      .min(0)
      .max(6)
      .required(),
  ).required(),
  duration: Joi
    .number()
    .integer()
    .multiple(24)
    .allow(null)
    .optional(),
  hours: Joi.enum().ofType(StudyHours).optional(),
  notes: Joi.string().allow('').required(),
};

export default {
  read: Joi.object().keys({
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
  }),
  update: Joi.object().keys({
    ...PERSISTED_COLUMNS_OPTIONAL,
    ...COLUMNS,
  }),
  create: Joi.object().keys(COLUMNS),
};
