import { StudyRequestAssignee, StudyRequestStatus, StudyType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

export default {
  assignees: Joi.array().single().items(
    Joi.enum().ofType(StudyRequestAssignee).required(),
  ).default([]),
  closed: Joi.boolean().default(false),
  column: Joi.string().default(null),
  createdAt: Joi.number().integer().default(0),
  lastEditedAt: Joi.number().integer().default(0),
  limit: Joi
    .number()
    .integer()
    .positive()
    .max(100)
    .required(),
  offset: Joi.number().integer().min(0).required(),
  query: Joi.string().default(null),
  sortBy: Joi.string().required(),
  sortDesc: Joi.boolean().required(),
  statuses: Joi.array().single().items(
    Joi.enum().ofType(StudyRequestStatus).required(),
  ).default([]),
  studyTypes: Joi.array().single().items(
    Joi.enum().ofType(StudyType).required(),
  ).default([]),
  studyTypeOther: Joi.boolean().default(false),
  userOnly: Joi.boolean().default(false),
};
