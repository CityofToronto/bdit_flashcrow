import Joi from '@hapi/joi';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.date().max('now').required(),
  userSubject: Joi.string().required(),
  studyRequestId: Joi.number().integer().positive().required(),
};

const COLUMNS = {
  studyType: Joi.string().valid(
    // TODO: DRY with Constants.COUNT_TYPES
    'ATR_VOLUME_BICYCLE',
    'PXO_OBSERVE',
    'PED_DELAY',
    'RESCU',
    'ATR_SPEED_VOLUME',
    'TMC',
    'ATR_VOLUME',
  ).required(),
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
