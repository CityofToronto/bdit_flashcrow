import Joi from '@/lib/model/Joi';
import StudyRequest from '@/lib/model/StudyRequest';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';
import ModelRelation from '@/lib/model/orm/ModelRelation';
import ModelRelationType from '@/lib/model/orm/ModelRelationType';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive(),
  createdAt: Joi.dateTime(),
  userId: Joi.number().integer().positive(),
};

const TRANSIENT_COLUMNS = {
  ccEmails: Joi.array().items(
    Joi.string().email({ tlds: false }).pattern(/@toronto\.ca$/),
  ),
  name: Joi.string(),
  notes: Joi.string(),
  studyRequests: new ModelRelation(StudyRequest, ModelRelationType.TO_MANY, false),
};

const StudyRequestBulk = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default StudyRequestBulk;
