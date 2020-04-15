import { Enum } from '@/lib/ClassUtils';

/**
 * Types of model relations.
 */
class ModelRelationType extends Enum {}
ModelRelationType.init([
  'TO_ONE',
  'TO_MANY',
]);

export default ModelRelationType;
