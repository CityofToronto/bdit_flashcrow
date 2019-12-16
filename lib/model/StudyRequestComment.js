import Joi from '@/lib/model/Joi';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.dateTime().required(),
  userSubject: Joi.string().required(),
  studyRequestId: Joi.number().integer().positive().required(),
};

const COLUMNS = {
  comment: Joi.string().required(),
};

export default {
  read: {
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
  },
  update: {
    ...PERSISTED_COLUMNS,
    ...COLUMNS,
  },
  create: COLUMNS,
};
