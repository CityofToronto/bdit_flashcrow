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
const SCOPE = 'email openid telephoneNumber title displayName';

class OpenIdClient {
  constructor(client) {
    this.client = client;
  }

  authorizationUrl(request) {
    const { nonce } = request.payload;
    return this.client.authorizationUrl({
      nonce,
      response_type: 'id_token',
      scope: SCOPE,
    });
  }

  async callback(request) {
    const [redirectUri] = config.openId.clientMetadata.redirect_uris;
    /* eslint-disable-next-line camelcase */
    const { id_token, nonce } = request.payload;
    const tokenSet = await this.client.callback(redirectUri, { id_token }, {
      nonce,
      response_type: 'id_token',
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
    /*
     * See https://auth0.com/docs/tokens/guides/id-token/validate-id-token for more details:
     * `this.client.callback` validates the `nonce`, but we must also validate `aud`.
     */
    if (aud !== config.openId.clientMetadata.client_id) {
      throw new InvalidOpenIdTokenError(`invalid audience ${aud} in ADFS token!`);
    }

    return { email, sub, uniqueName };
  }

  static async get() {
    if (CLIENT === null) {
      const issuer = await Issuer.discover(config.openId.issuerUrl);
      const client = new issuer.Client(config.openId.clientMetadata);
      CLIENT = new OpenIdClient(client);
    }
    return CLIENT;
  }
}

export default OpenIdClient;
