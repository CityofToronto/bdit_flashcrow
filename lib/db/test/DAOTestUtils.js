import childProcess from 'child_process';
import path from 'path';
import util from 'util';

const execFile = util.promisify(childProcess.execFile);
const GIT_ROOT = path.resolve(__dirname, '../../..');

class DAOTestUtils {
  static async startup() {
    const scriptStartup = path.resolve(GIT_ROOT, 'scripts/db/test/startup.sh');
    const { stdout } = await execFile(scriptStartup);
    console.log(stdout);
  }

  static async shutdown() {
    const scriptShutdown = path.resolve(GIT_ROOT, 'scripts/db/test/shutdown.sh');
    const { stdout } = await execFile(scriptShutdown);
    console.log(stdout);
  }
}

export default DAOTestUtils;
