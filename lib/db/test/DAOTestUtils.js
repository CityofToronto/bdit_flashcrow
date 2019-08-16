import childProcess from 'child_process';
import path from 'path';
import util from 'util';

import db from '@/../lib/db/db';

const execFile = util.promisify(childProcess.execFile);
const GIT_ROOT = path.resolve(__dirname, '../../..');

class DAOTestUtils {
  // TEST LIFECYCLE

  static async startup() {
    const scriptStartup = path.resolve(GIT_ROOT, 'scripts/db/test/startup.sh');
    const { stdout } = await execFile(scriptStartup);
    console.log(stdout);
  }

  static async startupWithDevData() {
    const scriptStartup = path.resolve(GIT_ROOT, 'scripts/db/test/startup.sh');
    const { stdout } = await execFile(scriptStartup, ['--withDevData']);
    console.log(stdout);
  }

  static async shutdown() {
    db.$pool.end();
    const scriptShutdown = path.resolve(GIT_ROOT, 'scripts/db/test/shutdown.sh');
    const { stdout } = await execFile(scriptShutdown);
    console.log(stdout);
  }

  // TODO: RANDOM GENERATORS
}
DAOTestUtils.TIMEOUT = 60000;

export default DAOTestUtils;
