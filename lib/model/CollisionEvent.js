import { CentrelineType } from '@/lib/Constants';
import CollisionInvolved from '@/lib/model/CollisionInvolved';
import Joi from '@/lib/model/Joi';
import { Point } from '@/lib/model/helpers/GeoJson';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';
import ModelRelation from '@/lib/model/orm/ModelRelation';
import ModelRelationType from '@/lib/model/orm/ModelRelationType';

const PERSISTED_COLUMNS = {
  collisionId: Joi.string(),
  accnb: Joi.string(),
  accdate: Joi.dateTime(),
  street1: Joi.string().allow(null),
  street2: Joi.string().allow(null),
  street3: Joi.string().allow(null),
  municipal: Joi.number().integer().min(0).allow(null),
  acclass: Joi.number().integer().min(0).allow(null),
  accloc: Joi.number().integer().min(0).allow(null),
  traffictl: Joi.number().integer().min(0).allow(null),
  impactype: Joi.number().integer().min(0).allow(null),
  visible: Joi.number().integer().min(0).allow(null),
  light: Joi.number().integer().min(0).allow(null),
  rdsfcond: Joi.number().integer().min(0).allow(null),
  changed: Joi.number().integer().allow(null),
  privateProperty: Joi.boolean(),
  roadClass: Joi.string().allow(null),
  mvaimg: Joi.number().integer().allow(null),
  description: Joi.string().allow(null),
  trafctlcond: Joi.number().integer().min(0).allow(null),
  geom: Point,
  centrelineId: Joi.number().integer().min(0).allow(null),
  centrelineType: Joi.number().valid(
    CentrelineType.INTERSECTION,
    CentrelineType.SEGMENT,
  ).allow(null),
  aggressive: Joi.boolean(),
  longitude: Joi.number().precision(15).allow(null),
  latitude: Joi.number().precision(15).allow(null),
  cityDamage: Joi.boolean(),
  cyclist: Joi.boolean(),
  injury: Joi.number().integer().min(0).allow(null),
  ksi: Joi.boolean(),
  motorcyclist: Joi.boolean(),
  olderAdult: Joi.boolean(),
  pedestrian: Joi.boolean(),
  redLight: Joi.boolean(),
  schoolChild: Joi.boolean(),
  speeding: Joi.boolean(),
  involved: new ModelRelation(CollisionInvolved, ModelRelationType.TO_MANY, false),
  src: Joi.string().allow(null),
};

const CollisionEvent = new Model(ModelField.persisted(PERSISTED_COLUMNS));

export default CollisionEvent;
