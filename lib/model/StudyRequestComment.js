import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive().required(),
  createdAt: Joi.dateTime().required(),
  userId: Joi.number().integer().positive().required(),
  studyRequestId: Joi.number().integer().positive().required(),
};

const TRANSIENT_COLUMNS = {
  comment: Joi.string().required(),
};

const StudyRequestComment = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default StudyRequestComment;
