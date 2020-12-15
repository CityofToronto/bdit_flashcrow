import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive(),
  collisionId: Joi.string(),
  vehNo: Joi.number().integer().min(0).allow(null),
  vehtype: Joi.number().integer().min(0).allow(null),
  initdir: Joi.number().integer().min(0).allow(null),
  imploc: Joi.number().integer().min(0).allow(null),
  // TODO: events 1-3
  perNo: Joi.number().integer().min(0).allow(null),
  invtype: Joi.number().integer().min(0).allow(null),
  invage: Joi.number().integer().min(0).allow(null),
  injury: Joi.number().integer().min(0).allow(null),
  safequip: Joi.number().integer().min(0).allow(null),
  drivact: Joi.number().integer().min(0).allow(null),
  drivcond: Joi.number().integer().min(0).allow(null),
  pedcond: Joi.number().integer().min(0).allow(null),
  pedact: Joi.number().integer().min(0).allow(null),
  // TODO: charges 1-4
  manoeuver: Joi.number().integer().min(0).allow(null),
  failtorem: Joi.boolean(),
  pedtype: Joi.number().integer().min(0).allow(null),
  cyclistype: Joi.number().integer().min(0).allow(null),
  cycact: Joi.number().integer().min(0).allow(null),
  cyccond: Joi.number().integer().min(0).allow(null),
  fatalNo: Joi.number().integer().min(0).allow(null),
  actualSpeed: Joi.number().integer().min(0).allow(null),
  postedSpeed: Joi.number().integer().min(0).allow(null),
  aggressive: Joi.boolean(),
  cyclist: Joi.boolean(),
  ksi: Joi.boolean(),
  motorcyclist: Joi.boolean(),
  olderAdult: Joi.boolean(),
  pedestrian: Joi.boolean(),
  propertyDamage: Joi.boolean(),
  schoolChild: Joi.boolean(),
  speeding: Joi.boolean(),
};

const CollisionInvolved = new Model(ModelField.persisted(PERSISTED_COLUMNS));

export default CollisionInvolved;
