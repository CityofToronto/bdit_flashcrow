import db from '@/lib/db/db';

const PgBossDatabaseWrapper = {
  executeSql: db.result,
};

export default PgBossDatabaseWrapper;
