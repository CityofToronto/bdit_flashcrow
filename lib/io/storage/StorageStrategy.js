import config from '@/lib/config/MoveConfig';
import { EnumValueError } from '@/lib/error/MoveErrors';
import StorageStrategyFilesystem from '@/lib/io/storage/StorageStrategyFilesystem';
import StorageType from '@/lib/io/storage/StorageType';

function getInstance(type, args) {
  if (type === StorageType.FILESYSTEM) {
    return new StorageStrategyFilesystem(...args);
  }
  throw new EnumValueError(type);
}

const { args, type } = config.storage;
const storageStrategy = getInstance(type, args);
export default storageStrategy;
