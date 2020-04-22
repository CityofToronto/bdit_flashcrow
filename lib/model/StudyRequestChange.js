import { StudyRequestStatus } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive(),
  createdAt: Joi.dateTime(),
  userId: Joi.number().integer().positive(),
  studyRequestId: Joi.number().integer().positive(),
};

const TRANSIENT_COLUMNS = {
  status: Joi.enum().ofType(StudyRequestStatus),
};

const StudyRequestChange = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default StudyRequestChange;
