import { CentrelineType } from '@/lib/Constants';
import CollisionInvolved from '@/lib/model/CollisionInvolved';
import Joi from '@/lib/model/Joi';
import GeoJson from '@/lib/model/helpers/GeoJson';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';
import ModelRelation from '@/lib/model/orm/ModelRelation';
import ModelRelationType from '@/lib/model/orm/ModelRelationType';

const PERSISTED_COLUMNS = {
  collisionId: Joi.number().integer().positive(),
  accnb: Joi.string(),
  accdate: Joi.dateTime(),
  street1: Joi.string().allow(null),
  street2: Joi.string().allow(null),
  street3: Joi.string().allow(null),
  municipal: Joi.number().integer().positive().allow(null),
  acclass: Joi.number().integer().positive().allow(null),
  accloc: Joi.number().integer().positive().allow(null),
  traffictl: Joi.number().integer().positive().allow(null),
  visible: Joi.number().integer().positive().allow(null),
  light: Joi.number().integer().positive().allow(null),
  rdsfcond: Joi.number().integer().positive().allow(null),
  changed: Joi.number().integer().allow(null),
  privateProperty: Joi.boolean(),
  roadClass: Joi.string().allow(null),
  mvaimg: Joi.number().integer().allow(null),
  description: Joi.string().allow(null),
  trafctlcond: Joi.number().integer().positive().allow(null),
  geom: GeoJson.Point,
  centrelineId: Joi.number().integer().positive(),
  centrelineType: Joi.number().valid(
    CentrelineType.INTERSECTION,
    CentrelineType.SEGMENT,
  ),
  aggressive: Joi.boolean(),
  cyclist: Joi.boolean(),
  ksi: Joi.boolean(),
  motorcyclist: Joi.boolean(),
  olderAdult: Joi.boolean(),
  pedestrian: Joi.boolean(),
  propertyDamage: Joi.boolean(),
  schoolChild: Joi.boolean(),
  speeding: Joi.boolean(),
  involved: new ModelRelation(CollisionInvolved, ModelRelationType.TO_MANY, false),
};

const CollisionEvent = new Model(ModelField.persisted(PERSISTED_COLUMNS));

export default CollisionEvent;
