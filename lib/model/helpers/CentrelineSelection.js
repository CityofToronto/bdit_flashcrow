import Joi from '@/lib/model/Joi';

export default {
  s1: Joi
    .compositeId()
    .ofType('s1')
    .description('encoded set of centreline features'),
};
