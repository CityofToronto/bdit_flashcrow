import { custom, Issuer } from 'openid-client';

import config from '@/lib/config/MoveConfig';
import { InvalidOpenIdTokenError } from '@/lib/error/MoveErrors';

/*
 * TODO: remove this once we figure out how to configure Vagrant to respect the host OS
 * certificate trust store.  It would be a much better solution to add all certificates
 * in the `https://ma-qa.toronto.ca` chain there.
 */
if (config.ENV === 'development' || config.env === 'test') {
  custom.setHttpOptionsDefaults({
    rejectUnauthorized: false,
  });
}

let CLIENT = null;
const SCOPE = 'code email telephoneNumber title displayName';

class OpenIdClient {
  constructor(client) {
    this.client = client;
  }

  authorizationUrl() {
    return this.client.authorizationUrl({
      response_type: 'code',
      scope: SCOPE,
    });
  }

  async callback(request) {
    const [redirectUri] = config.openId.clientMetadata.redirect_uris;
    /* eslint-disable-next-line camelcase */
    const { code } = request.query;
    const tokenSet = await this.client.callback(redirectUri, { code }, {
      response_type: 'code',
    });

    if (tokenSet.expired()) {
      throw new InvalidOpenIdTokenError('token expired!');
    }

    const {
      aud,
      sub,
      unique_name: uniqueName,
      upn: email,
    } = tokenSet.claims();

    if (aud !== config.openId.clientMetadata.client_id) {
      throw new InvalidOpenIdTokenError(`invalid audience ${aud} in ADFS token!`);
    }

    return { email, sub, uniqueName };
  }

  static async get() {
    if (CLIENT === null) {
      const issuer = await Issuer.discover(config.openId.issuerUrl);
      const client = new issuer.Client({
        token_endpoint_auth_method: 'none',
        ...config.openId.clientMetadata,
      });
      CLIENT = new OpenIdClient(client);
    }
    return CLIENT;
  }
}

export default OpenIdClient;
