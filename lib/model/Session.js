import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  id: Joi.string().uuid(),
  createdAt: Joi.dateTime(),
  expiresAt: Joi.dateTime(),
  userId: Joi.number().integer().positive(),
};

const StudyRequest = new Model(ModelField.persisted(PERSISTED_COLUMNS));

export default StudyRequest;
