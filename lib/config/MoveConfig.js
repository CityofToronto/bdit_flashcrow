import path from 'path';
import Joi from '@/lib/model/Joi';

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
 * On AWS, we get PostgreSQL connection parameters and domain name information from
 * environment variable files.
 *
 * We don't have such files in local development, but it doesn't matter there - we use
 * the `development` or `test` environments below in those cases.
 */
const {
  PGDATABASE = 'PGDATABASE',
  PGHOST = 'PGHOST',
  PGUSER = 'PGUSER',
  DomainName: DOMAIN_NAME = 'DomainName',
} = process.env;
const productionDb = `postgres://${PGUSER}@${PGHOST}/${PGDATABASE}`;

const testPort = 'API_TEST_HEADLESS' in process.env ? 8080 : 8081;

function getAdfsIssuerUrl(domainName) {
  switch (domainName) {
    case 'move.intra.dev-toronto.ca':
    default:
      return 'https://adfs.lab.intra.sandbox-toronto.ca/adfs';
  }
}

function getEmailSender(domainName) {
  switch (domainName) {
    case 'move.intra.dev-toronto.ca':
    default:
      return 'move-team@email1.dev-toronto.ca';
  }
}

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
    port: 8081,
    session: {},
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
    emailSender: getEmailSender(DOMAIN_NAME),
    host: 'localhost',
    https: null,
    openId: {
      clientMetadata: {
        redirect_uris: [
          `https://${DOMAIN_NAME}/api/auth/adfs-callback`,
        ],
      },
      issuerUrl: getAdfsIssuerUrl(DOMAIN_NAME),
    },
    port: 8081,
    session: {
      /*
       * In production, we need the cookie to be tied to our ELB domain
       * name, not localhost.
       */
      domain: DOMAIN_NAME,
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
  sendGrid: Joi.string().required(),
  session: Joi.object().keys({
    domain: Joi.string().hostname().optional(),
    password: Joi.string().required(),
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

MoveConfig.BASE_DIR = BASE_DIR;
MoveConfig.ENV = ENV;
MoveConfig.PUBLIC_PATH = vueConfig.publicPath;

export default MoveConfig;
