import Joi from '@/lib/model/Joi';
import ModelRelation from '@/lib/model/orm/ModelRelation';
import ModelRelationType from '@/lib/model/orm/ModelRelationType';
import User from '@/lib/model/User';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';

const PERSISTED_COLUMNS = {
  user: new ModelRelation(User, ModelRelationType.TO_ONE, false),
  message: Joi.string(),
  color: Joi.string(),
};

const BannerRequest = new Model(ModelField.persisted(PERSISTED_COLUMNS));

export default BannerRequest;
