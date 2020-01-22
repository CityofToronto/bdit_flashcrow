import Joi from '@/lib/model/Joi';

export default {
  Point: Joi.object().keys({
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().length(2).ordered(
      Joi.number().min(-180).max(180).required(),
      Joi.number().min(-90).max(90).required(),
    ).required(),
  }),
};
