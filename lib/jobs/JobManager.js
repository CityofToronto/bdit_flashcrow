import PgBoss from 'pg-boss';

import config from '@/lib/config/MoveConfig';

const PG_BOSS = new PgBoss(config.db);

class JobManager {
  static async cleanup() {
    await PG_BOSS.stop();
  }

  static async init() {
    await PG_BOSS.start();
  }
}

export default JobManager;
