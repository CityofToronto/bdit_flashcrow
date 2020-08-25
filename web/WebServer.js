import AuthController from '@/lib/controller/AuthController';
import CollisionController from '@/lib/controller/CollisionController';
import DynamicTileController from '@/lib/controller/DynamicTileController';
import LocationController from '@/lib/controller/LocationController';
import PoiController from '@/lib/controller/PoiController';
import StorageController from '@/lib/controller/StorageController';
import StudyController from '@/lib/controller/StudyController';
import StudyRequestController from '@/lib/controller/StudyRequestController';
import UserController from '@/lib/controller/UserController';
import MoveServer from '@/lib/server/MoveServer';

class WebServer extends MoveServer {
  constructor(args) {
    super('web', args);

    this
      .addController(AuthController)
      .addController(CollisionController)
      .addController(DynamicTileController)
      .addController(LocationController)
      .addController(PoiController)
      .addController(StorageController)
      .addController(StudyController)
      .addController(StudyRequestController)
      .addController(UserController)
      .enableAuth();
  }
}

export default WebServer;
