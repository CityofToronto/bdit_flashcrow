import { StudyRequestAssignee, StudyRequestStatus, StudyType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

export default {
  assignees: Joi.array().single().items(
    Joi.enum().ofType(StudyRequestAssignee).allow(''),
  ).default([]),
  column: Joi.string().valid(
    'ID',
    'LOCATION',
    'REQUESTER',
    null,
  ).default(null),
  createdAtEnd: Joi.dateTime().allow(null).default(null),
  createdAtStart: Joi.dateTime().allow(null).default(null),
  dueDateEnd: Joi.dateTime().allow(null).default(null),
  dueDateStart: Joi.dateTime().allow(null).default(null),
  limit: Joi
    .number()
    .integer()
    .positive()
    .max(100)
    .required(),
  offset: Joi.number().integer().min(0).required(),
  query: Joi.string().allow(null).default(null),
  sortBy: Joi.string().valid(
    'CREATED_AT',
    'DUE_DATE',
    'ID',
    'LOCATION',
    'REQUESTER',
  ).required(),
  sortDesc: Joi.boolean().required(),
  statuses: Joi.array().single().items(
    Joi.enum().ofType(StudyRequestStatus),
  ).default([]),
  studyTypes: Joi.array().single().items(
    Joi.enum().ofType(StudyType),
  ).default([]),
  studyTypeOther: Joi.boolean().default(false),
  userOnly: Joi.boolean().default(false),
};
