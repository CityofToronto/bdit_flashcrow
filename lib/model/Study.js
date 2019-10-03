import Joi from '@hapi/joi';

import { COUNT_TYPES } from '@/lib/Constants';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.date().max('now').required(),
  userSubject: Joi.string().required(),
  studyRequestId: Joi.number().integer().positive().required(),
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
  duration: Joi.number().integer().multiple(24).optional(),
  hours: Joi.string().valid('ROUTINE', 'SCHOOL', 'OTHER').optional(),
  notes: Joi.string().allow('').required(),
};

export default {
  persisted: {
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
  },
  transient: COLUMNS,
};
