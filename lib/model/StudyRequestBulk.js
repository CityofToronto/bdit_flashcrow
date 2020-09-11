import { LocationSelectionType, StudyRequestReason } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import StudyRequest from '@/lib/model/StudyRequest';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';
import ModelRelation from '@/lib/model/orm/ModelRelation';
import ModelRelationType from '@/lib/model/orm/ModelRelationType';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive(),
  createdAt: Joi.dateTime(),
  userId: Joi.number().integer().positive(),
  lastEditorId: Joi.number().integer().positive().allow(null),
  lastEditedAt: Joi.dateTime().allow(null),
};

const TRANSIENT_COLUMNS = {
  ccEmails: Joi.array().items(
    Joi.string().email({ tlds: false }).pattern(/@toronto\.ca$/),
  ).when(
    'urgent',
    {
      is: true,
      then: Joi.array().min(1),
    },
  ),
  dueDate: Joi.dateTime(),
  estimatedDeliveryDate: Joi.dateTime(),
  name: Joi.string(),
  reason: Joi.enum().ofType(StudyRequestReason),
  reasonOther: Joi.when(
    'reason',
    {
      is: Joi.valid(StudyRequestReason.OTHER),
      then: Joi.string(),
      otherwise: Joi.valid(null),
    },
  ),
  ...CentrelineSelection,
  selectionType: Joi.enum().ofType(LocationSelectionType),
  studyRequests: new ModelRelation(StudyRequest, ModelRelationType.TO_MANY, false),
  urgent: Joi.boolean(),
  urgentReason: Joi.string().when(
    'urgent',
    {
      is: true,
      otherwise: Joi.allow(null),
    },
  ),
};

const StudyRequestBulk = new Model([
  ...ModelField.persisted(PERSISTED_COLUMNS),
  ...ModelField.transient(TRANSIENT_COLUMNS),
]);

export default StudyRequestBulk;
