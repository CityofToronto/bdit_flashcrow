import { CardinalDirection, StudyHours, StudyType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

const COLUMNS = {
  id: Joi.number().integer().positive().required(),
  legacy: Joi.boolean().required(),
  studyType: Joi.enum().ofType(StudyType).required(),
  hours: Joi.enum().ofType(StudyHours).allow(null).required(),
  date: Joi.dateTime().required(),
  notes: Joi.string().allow(null).required(),
  countLocationId: Joi.number().integer().positive(),
  direction: Joi.enum().ofType(CardinalDirection).allow(null).required(),
  extraMetadata: Joi.object().unknown(),
};

export default {
  read: Joi.object().keys(COLUMNS),
};
