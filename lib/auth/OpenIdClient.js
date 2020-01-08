import { custom, generators, Issuer } from 'openid-client';

import config from '@/lib/config/MoveConfig';

if (config.ENV === 'development') {
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

  authorizationUrl() {
    const nonce = generators.nonce();
    console.log(nonce);
    const authorizationUrl = this.client.authorizationUrl({
      nonce,
      response_type: 'id_token',
      scope: SCOPE,
    });
    return { authorizationUrl, nonce };
  }

  async callback(request) {
    const [redirectUri] = config.openId.clientMetadata.redirect_uris;
    const parameters = this.client.callbackParams(request.raw.req);
    const { nonce } = request.payload;
    return this.client.callback(redirectUri, parameters, {
      nonce,
      response_type: 'id_token',
    });
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
