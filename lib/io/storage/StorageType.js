import { Enum } from '@/lib/ClassUtils';

class StorageType extends Enum {}
StorageType.init([
  'FILESYSTEM',
]);

export default StorageType;
