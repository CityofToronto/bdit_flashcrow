import childProcess from 'child_process';
import path from 'path';
import util from 'util';
import uuid from 'uuid/v4';

import db from '@/../lib/db/db';
import Random from '@/lib/Random';

const execFile = util.promisify(childProcess.execFile);
const GIT_ROOT = path.resolve(__dirname, '../../..');

const FIRST_NAMES = [
  'Jane',
  'John',
  'Jorge',
  'Javier',
  'Jie',
  'Janis',
  'Jale',
];

const LAST_NAMES = [
  'Doe',
  'Doherty',
  'Duende',
  'Dortmund',
  'Daichi',
  'Devan',
  'Dagher',
  'Dimitriou',
];

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

  // RANDOM GENERATORS

  static randomUserName() {
    const first = Random.choice(FIRST_NAMES);
    const last = Random.choice(LAST_NAMES);
    const full = `${first} ${last}`;
    return { first, last, full };
  }

  static randomUserEmail({ first, last }) {
    const suffix = Random.range(1000, 10000);
    return `${first}.${last}${suffix}@toronto.ca`;
  }

  static randomUser() {
    const subject = uuid();
    const token = uuid();
    const name = DAOTestUtils.randomUserName();
    const email = DAOTestUtils.randomUserEmail(name);
    return {
      subject,
      token,
      name: name.full,
      email,
    };
  }
}
DAOTestUtils.TIMEOUT = 60000;

export default DAOTestUtils;
