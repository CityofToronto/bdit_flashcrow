import Joi from '@/lib/model/Joi';

const Lng = Joi.number().min(-180).max(180);
const Lat = Joi.number().min(-90).max(90);

const LngLat = Joi.array().length(2).ordered(Lng.required(), Lat.required());

const LineString = Joi.object().keys({
  type: Joi.string().valid('LineString').required(),
  coordinates: Joi.array().items(
    LngLat.required(),
  ).required(),
});

const Point = Joi.object().keys({
  type: Joi.string().valid('Point').required(),
  coordinates: LngLat.required(),
});

const GeoJson = {
  Lat,
  LineString,
  Lng,
  LngLat,
  Point,
};

export {
  GeoJson as default,
  Lat,
  LineString,
  Lng,
  LngLat,
  Point,
};
