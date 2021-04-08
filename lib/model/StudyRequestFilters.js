import { StudyRequestAssignee, StudyRequestStatus, StudyType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

export default {
  assignees: Joi.array().single().items(
    Joi.enum().ofType(StudyRequestAssignee).allow('').required(),
  ).default([]),
  column: Joi.string().valid(
    'ASSIGNED_TO',
    'ID',
    'LOCATION',
    'REQUESTER',
    'STATUS',
    'STUDY_TYPE',
  ).default(null),
  limit: Joi
    .number()
    .integer()
    .positive()
    .max(100)
    .required(),
  offset: Joi.number().integer().min(0).required(),
  query: Joi.string().default(null),
  sortBy: Joi.string().valid(
    'CREATED_AT',
    'DUE_DATE',
    'ID',
    'LOCATION',
    'REQUESTER',
  ).required(),
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
