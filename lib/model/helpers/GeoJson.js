import Joi from '@hapi/joi';

const GeoJson = {
  Point: {
    type: Joi.string().valid('Point').required(),
    coordinates: Joi.array().length(2).ordered(
      Joi.number().min(-180).max(180).required(),
      Joi.number().min(-90).max(90).required(),
    ).required(),
  },
};

export default GeoJson;
