import path from 'path';
import Joi from '@/lib/model/Joi';

import privateConfig from '@/lib/config/private';
import vueConfig from '@/vue.config';
import { ENV } from '@/lib/config/Env';
import StorageType from '@/lib/io/storage/StorageType';

// ENVIRONMENT-SPECIFIC CONFIGS

/*
 * Note that this file *is* checked into source control.  Do *NOT* put
 * credentials in here!  Those belong in `lib/config/private.js`, which
 * is `.gitignore`'d.
 *
 * `MoveConfig` provides three build types for MOVE to run in:
 *
 * - development: within Vagrant on local dev machines;
 * - test: like development, but with a separate test database;
 * - production: any of the AWS environments, *including* AWS development, QA, and staging
 *   environments.
 *
 * This follows the convention of using `NODE_ENV=development` vs. `NODE_ENV=production` to
 * switch between development (i.e. debug) and production (i.e. release) builds, especially
 * when using webpack.
 *
 * All AWS environments use the production (i.e. release) build.  `lib/config/private` contains
 * AWS environment-specific configurations, such as credentials and keys that are provisioned
 * separately for dev, QA, staging, and production.
 */

/*
 * On AWS, we get PostgreSQL connection parameters and domain name information from
 * environment variable files.
 *
 * In local development and test, we use the corresponding build configurations below.
 */
const {
  HOME,
  PGDATABASE = 'PGDATABASE',
  PGHOST = 'PGHOST',
  PGUSER = 'PGUSER',
  DomainName: DOMAIN_NAME = 'DomainName',
  EmailSender: EMAIL_SENDER = 'EmailSender',
  AdfsIssuerUrl: ADFS_ISSUER_URL = 'AdfsIssuerUrl',
} = process.env;
const productionDb = `postgres://${PGUSER}@${PGHOST}/${PGDATABASE}`;

const testPort = 'API_TEST_HEADLESS' in process.env ? 8080 : 8100;

const config = {
  development: {
    /*
     * These connection strings deliberately do *NOT* contain any passwords.  We rely on
     * the system to have a properly configured `.pgpass` containing the correct password.
     */
    db: 'postgres://flashcrow@localhost:5432/flashcrow',
    emailSender: 'move-team@email1.dev-toronto.ca',
    host: '0.0.0.0',
    https: vueConfig.devServer.https,
    openId: {
      clientMetadata: {
        redirect_uris: [
          'https://localhost:8080/api/auth/adfs-callback',
        ],
      },
      issuerUrl: 'https://ma-qa.toronto.ca/adfs',
    },
    port: 8100,
    /*
     * In our local (development and test) environments, we call `reporter` directly on port
     * 8200, as these environments only have a single `reporter` instance running on that port.
     */
    reporter: 'https://localhost:8200',
    session: {},
    storage: {
      type: StorageType.FILESYSTEM,
      args: [`${HOME}/data/move-storage/development`],
    },
    webPort: 8080,
  },
  test: {
    db: 'postgres://flashcrow@localhost:5433/flashcrow',
    emailSender: 'move-team@email1.dev-toronto.ca',
    host: '0.0.0.0',
    https: vueConfig.devServer.https,
    openId: {
      clientMetadata: {
        redirect_uris: [
          `https://localhost:${testPort}/api/auth/adfs-callback`,
        ],
      },
      issuerUrl: 'https://ma-qa.toronto.ca/adfs',
    },
    /*
     * The npm script `backend:test-api` runs `web/web.js` with the `API_TEST_HEADLESS`
     * environment variable, which instructs the server to start up directly on port
     * 8080.  (Here we're not testing the frontend, so we don't need `webpack-dev-server`
     * to proxy for us!)
     */
    port: testPort,
    reporter: 'https://localhost:8200',
    session: {},
    storage: {
      type: StorageType.FILESYSTEM,
      args: [`${HOME}/data/move-storage/test`],
    },
    webPort: 8080,
  },
  production: {
    db: productionDb,
    emailSender: EMAIL_SENDER,
    host: 'localhost',
    https: null,
    openId: {
      clientMetadata: {
        redirect_uris: [
          `https://${DOMAIN_NAME}/api/auth/adfs-callback`,
        ],
      },
      issuerUrl: ADFS_ISSUER_URL,
    },
    port: 8100,
    /*
     * On AWS, we use the `upstream` block defined in `nginx` configs, which load-balances
     * between multiple running `reporter` instances.
     */
    reporter: 'http://localhost/reporter',
    session: {
      /*
       * On AWS, we need the cookie to be tied to our ELB domain name instead of localhost.
       */
      domain: DOMAIN_NAME,
    },
    storage: {
      type: StorageType.FILESYSTEM,
      /*
       * On AWS, we use the EFS mount for now - we'll eventually change that to S3 once
       * that's available.
       */
      args: ['/data/move-storage'],
    },
    webPort: 443,
  },
};

// CONFIG MERGING AND VALIDATION

const configSchema = Joi.object().keys({
  db: Joi.string().uri({
    scheme: 'postgres',
  }),
  emailSender: Joi.string().required(),
  host: Joi.string().hostname(),
  https: Joi.object().keys({
    /*
     * We would normally use `Joi.binary()` here, but we're now using the browser build
     * of `Joi` for both client and server - and that doesn't provide `Joi.binary()`, as
     * it depends on the node.js Buffer type.
     */
    key: Joi.any().required(),
    cert: Joi.any().required(),
  }).allow(null).required(),
  openId: Joi.object().keys({
    clientMetadata: Joi.object().keys({
      client_id: Joi.string().uuid().required(),
      client_secret: Joi.string().optional(),
      redirect_uris: Joi.array().items(
        Joi.string().required(),
      ).required(),
      token_endpoint_auth_method: Joi.string().valid('none').optional(),
    }),
    issuerUrl: Joi.string().uri().required(),
  }),
  port: Joi.number().integer().positive().required(),
  reporter: Joi.string().uri(),
  sendGrid: Joi.string().optional(),
  session: Joi.object().keys({
    domain: Joi.string().hostname().optional(),
    password: Joi.string().required(),
  }).required(),
  storage: Joi.object().keys({
    type: Joi.enum().ofType(StorageType).required(),
    args: Joi.array().items(
      Joi.string(),
    ).required(),
  }).required(),
  webPort: Joi.number().integer().positive().required(),
});

// CONFIG SELECTION BASED ON ENVIRONMENT

const MoveConfig = config[ENV];
if (!MoveConfig) {
  throw new Error(`missing public configuration for ${ENV}`);
}

let privateConfigDomain = privateConfig[ENV];
if (ENV === 'production') {
  /*
   * As mentioned, the
   */
  privateConfigDomain = privateConfigDomain[DOMAIN_NAME];
}
if (!privateConfigDomain) {
  throw new Error(`missing private configuration for ${ENV} (${DOMAIN_NAME})`);
}

MoveConfig.openId.clientMetadata = {
  ...MoveConfig.openId.clientMetadata,
  ...privateConfigDomain.openId.clientMetadata,
};
MoveConfig.sendGrid = privateConfigDomain.sendGrid;
MoveConfig.session.password = privateConfigDomain.session.password;
Joi.assert(MoveConfig, configSchema, { convert: false });

const BASE_DIR = path.resolve(__dirname, '../..');
const PUBLIC_PATH = vueConfig.publicPath;

export default {
  ...MoveConfig,
  BASE_DIR,
  ENV,
  PUBLIC_PATH,
};
