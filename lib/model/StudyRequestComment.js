import Joi from '@/lib/model/Joi';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.dateTime().required(),
  userId: Joi.number().integer().positive().required(),
  studyRequestId: Joi.number().integer().positive().required(),
};

const COLUMNS = {
  comment: Joi.string().required(),
};

export default {
  read: Joi.object().keys({
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
  }),
  update: Joi.object().keys({
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
  }),
  create: Joi.object().keys(COLUMNS),
};
