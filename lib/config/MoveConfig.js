import Joi from '@hapi/joi';
import path from 'path';

import privateConfig from '@/lib/config/private';
import vueConfig from '@/vue.config';
import { ENV } from '@/lib/config/Env';

// ENVIRONMENT-SPECIFIC CONFIGS

/*
 * Note that this file *is* checked into source control.  Do *NOT* put
 * credentials in here!  Those belong in `lib/config/private.js`, which
 * is `.gitignore`'d.
 */

/*
 * On AWS, we get PostgreSQL connection parameters from environment variable files.
 *
 * We don't have such files in local development, but it doesn't matter there - we use
 * the `development` or `test` environments below in those cases.
 */
const {
  PGDATABASE = 'PGDATABASE',
  PGHOST = 'PGHOST',
  PGUSER = 'PGUSER',
} = process.env;
const productionDb = `postgres://${PGUSER}@${PGHOST}/${PGDATABASE}`;

const testPort = 'API_TEST_HEADLESS' in process.env ? 8080 : 8081;

const config = {
  development: {
    /*
     * These connection strings deliberately do *NOT* contain any passwords.  We rely on
     * the system to have a properly configured `.pgpass` containing the correct password.
     */
    db: 'postgres://flashcrow@localhost:5432/flashcrow',
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
    port: 8081,
    session: {},
    webPort: 8080,
  },
  test: {
    db: 'postgres://flashcrow@localhost:5433/flashcrow',
    host: '0.0.0.0',
    https: vueConfig.devServer.https,
    openId: {
      clientMetadata: {
        redirect_uris: [
          `https://localhost:${testPort}/auth/adfs-callback`,
        ],
      },
      issuerUrl: 'https://ma-qa.toronto.ca/adfs',
    },
    /*
     * The npm script `backend:test-api` runs `web/server.js` with the `API_TEST_HEADLESS`
     * environment variable, which instructs the server to start up directly on port
     * 8080.  (Here we're not testing the frontend, so we don't need `webpack-dev-server`
     * to proxy for us!)
     */
    port: testPort,
    session: {},
    webPort: 8080,
  },
  production: {
    db: productionDb,
    host: 'localhost',
    https: null,
    openId: {
      clientMetadata: {
        redirect_uris: [
          'https://move.intra.dev-toronto.ca/auth/adfs-callback',
        ],
      },
      issuerUrl: 'https://cotauth.toronto.ca/adfs',
    },
    port: 8081,
    session: {
      /*
       * In production, we need the cookie to be tied to our ELB domain
       * name, not localhost.
       */
      domain: 'move.intra.dev-toronto.ca',
    },
    webPort: 443,
  },
};

// CONFIG MERGING AND VALIDATION

const configSchema = Joi.object().keys({
  db: Joi.string().uri({
    scheme: 'postgres',
  }),
  host: Joi.string().hostname(),
  https: Joi.object().keys({
    key: Joi.any().required(),
    cert: Joi.any().required(),
  }).allow(null).required(),
  openId: Joi.object().keys({
    clientMetadata: Joi.object().keys({
      client_id: Joi.string().uuid().required(),
      redirect_uris: Joi.array().items(
        Joi.string().required(),
      ).required(),
    }),
    issuerUrl: Joi.string().uri().required(),
  }),
  port: Joi.number().integer().positive().required(),
  sendGrid: Joi.string().required(),
  session: Joi.object().keys({
    domain: Joi.string().hostname().optional(),
    password: Joi.string().required(),
  }).required(),
  webPort: Joi.number().integer().positive().required(),
});

Object.keys(config).forEach((key) => {
  /* eslint-disable-next-line camelcase */
  config[key].openId.clientMetadata.client_id = privateConfig[key].openId.clientMetadata.client_id;
  config[key].sendGrid = privateConfig[key].sendGrid;
  config[key].session.password = privateConfig[key].session.password;
  Joi.assert(config[key], configSchema, { convert: false });
});

// CONFIG SELECTION BASED ON ENVIRONMENT

if (!config[ENV]) {
  throw new Error(`missing configuration for ${ENV}`);
}

const BASE_DIR = path.resolve(__dirname, '../..');

const MoveConfig = {
  ...config[ENV],
  BASE_DIR,
  ENV,
  PUBLIC_PATH: vueConfig.publicPath,
};

export default MoveConfig;
