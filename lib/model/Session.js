import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

/*
 * Session instances are generated within `SessionDAO.create` from an authenticated user and
 * a TTL (time-to-live), so there is no concept of a "transient" instance here.
 */
const PERSISTED_COLUMNS = {
  id: Joi.string().uuid(),
  createdAt: Joi.dateTime(),
  expiresAt: Joi.dateTime(),
  userId: Joi.number().integer().positive(),
};

const StudyRequest = new Model(ModelField.persisted(PERSISTED_COLUMNS));

export default StudyRequest;
