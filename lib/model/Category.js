import { StudyType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

const COLUMNS = {
  id: Joi.number().integer().positive().required(),
  name: Joi.string().required(),
  studyType: Joi.enum().ofType(StudyType).allow(null).required(),
};

export default {
  read: Joi.object().keys(COLUMNS),
};
