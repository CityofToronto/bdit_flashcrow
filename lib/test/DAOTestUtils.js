import childProcess from 'child_process';
import path from 'path';
import util from 'util';

import db from '@/lib/db/db';

const execFile = util.promisify(childProcess.execFile);
const GIT_ROOT = path.resolve(__dirname, '../..');
const EXEC_FILE_OPTIONS = {
  maxBuffer: 4 * 1024 * 1024,
};

class DAOTestUtils {
  // TEST LIFECYCLE

  static async startup() {
    const scriptStartup = path.resolve(GIT_ROOT, 'scripts/test/db/startup.sh');
    const { stdout } = await execFile(scriptStartup, EXEC_FILE_OPTIONS);
    console.log(stdout);
  }

  static async startupWithDevData() {
    const scriptStartup = path.resolve(GIT_ROOT, 'scripts/test/db/startup.sh');
    const { stdout } = await execFile(scriptStartup, ['--withDevData'], EXEC_FILE_OPTIONS);
    console.log(stdout);
  }

  static async shutdown() {
    db.$pool.end();
    const scriptShutdown = path.resolve(GIT_ROOT, 'scripts/test/db/shutdown.sh');
    const { stdout } = await execFile(scriptShutdown, EXEC_FILE_OPTIONS);
    console.log(stdout);
  }
}
DAOTestUtils.TIMEOUT = 80000;

export default DAOTestUtils;
