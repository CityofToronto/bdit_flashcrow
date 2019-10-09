import Joi from '@hapi/joi';
import path from 'path';

import privateConfig from './private';
import vueConfig from '@/vue.config';
import { ENV } from '@/lib/config/Env';

// ENVIRONMENT-SPECIFIC CONFIGS

/*
 * Note that this file *is* checked into source control.  Do *NOT* put
 * credentials in here!  Those belong in `lib/config/private.js`, which
 * is `.gitignore`'d.
 */

const config = {
  development: {
    /*
     * These connection strings deliberately do *NOT* contain any passwords.  We rely on
     * the system to have a properly configured `.pgpass` containing the correct password.
     */
    db: 'postgres://flashcrow@localhost:5432/flashcrow',
    host: '0.0.0.0',
    https: vueConfig.devServer.https,
    port: 8081,
    session: {},
    webPort: 8080,
  },
  test: {
    db: 'postgres://flashcrow@localhost:5433/flashcrow',
    host: '0.0.0.0',
    https: vueConfig.devServer.https,
    /*
     * The npm script `backend:test-api` runs `web/server.js` with the `API_TEST_HEADLESS`
     * environment variable, which instructs the server to start up directly on port
     * 8080.  (Here we're not testing the frontend, so we don't need `webpack-dev-server`
     * to proxy for us!)
     */
    port: 'API_TEST_HEADLESS' in process.env ? 8080 : 8081,
    session: {},
    webPort: 8080,
  },
  production: {
    db: 'postgres://flashcrow@fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com:5432/flashcrow',
    host: 'localhost',
    https: null,
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
    key: Joi.binary().required(),
    cert: Joi.binary().required(),
  }).allow(null).required(),
  port: Joi.number().integer().positive().required(),
  sendGrid: Joi.string().required(),
  session: Joi.object().keys({
    domain: Joi.string().hostname().optional(),
    password: Joi.string().required(),
  }).required(),
  webPort: Joi.number().integer().positive().required(),
});

Object.keys(config).forEach((key) => {
  config[key].sendGrid = privateConfig[key].sendGrid;
  config[key].session.password = privateConfig[key].session.password;
  const { error } = Joi.validate(config[key], configSchema, {
    convert: false,
  });
  if (error !== null) {
    throw error;
  }
});

// CONFIG SELECTION BASED ON ENVIRONMENT

if (!config[ENV]) {
  throw new Error(`missing configuration for ${ENV}`);
}

const BASE_DIR = path.resolve(__dirname, '../..');

export default Object.assign(config[ENV], {
  BASE_DIR,
  ENV,
  PUBLIC_PATH: vueConfig.publicPath,
});
