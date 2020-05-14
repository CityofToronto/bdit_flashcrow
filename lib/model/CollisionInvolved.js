import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  id: Joi.number().integer().positive(),
  collisionId: Joi.number().integer().positive(),
  vehNo: Joi.number().integer().positive().allow(null),
  vehtype: Joi.number().integer().positive().allow(null),
  imploc: Joi.number().integer().positive().allow(null),
  // TODO: events 1-3
  perNo: Joi.number().integer().positive().allow(null),
  invtype: Joi.number().integer().positive().allow(null),
  invage: Joi.number().integer().positive().allow(null),
  injury: Joi.number().integer().positive().allow(null),
  safequip: Joi.number().integer().positive().allow(null),
  drivact: Joi.number().integer().positive().allow(null),
  drivcond: Joi.number().integer().positive().allow(null),
  pedcond: Joi.number().integer().positive().allow(null),
  pedact: Joi.number().integer().positive().allow(null),
  // TODO: charges 1-4
  manoeuver: Joi.number().integer().positive().allow(null),
  failtorem: Joi.boolean(),
  pedtype: Joi.number().integer().positive().allow(null),
  cyclistype: Joi.number().integer().positive().allow(null),
  cycact: Joi.number().integer().positive().allow(null),
  cyccond: Joi.number().integer().positive().allow(null),
  fatalNo: Joi.number().integer().positive().allow(null),
  actualSpeed: Joi.number().integer().positive().allow(null),
  postedSpeed: Joi.number().integer().positive().allow(null),
};

const CollisionInvolved = new Model(ModelField.persisted(PERSISTED_COLUMNS));

export default CollisionInvolved;
