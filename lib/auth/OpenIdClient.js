/* eslint-disable camelcase */
import { Issuer } from 'openid-client';
import { jwtDecode } from 'jwt-decode';
import 'core-js/stable/atob';

import config from '@/lib/config/MoveConfig';
import { InvalidOpenIdTokenError } from '@/lib/error/MoveErrors';

let CLIENT = null;
const SCOPE = 'email openid profile';

// These are the values that we think we may want to use, but they aren't always part
// of the access_token, so we check if they exist before trying to assign them.
const parseToken = (token) => {
  const parsedToken = {};
  const decodedToken = jwtDecode(token);
  // Future versions should use Object.hasOwn(decodedToken, 'email'), but this isn't
  // supported in this version.
  parsedToken.email = 'email' in decodedToken ? decodedToken.email : null;
  parsedToken.uniqueName = 'unique_name' in decodedToken ? decodedToken.unique_name : null;
  parsedToken.userTitle = 'UserTitle' in decodedToken ? decodedToken.UserTitle : null;
  parsedToken.firstName = 'given_name' in decodedToken ? decodedToken.given_name : null;
  parsedToken.lastName = 'family_name' in decodedToken ? decodedToken.family_name : null;
  parsedToken.department = 'Department' in decodedToken ? decodedToken.Department : null;
  return parsedToken;
};

class OpenIdClient {
  constructor(client) {
    this.client = client;
  }

  authorizationUrl() {
    return this.client.authorizationUrl({
      prompt: 'login',
      response_type: 'code',
      scope: SCOPE,
    });
  }

  async callback(request) {
    const [redirectUri] = config.openId.clientMetadata.redirect_uris;
    const { code } = request.query;
    const tokenSet = await this.client.callback(redirectUri, { code }, {
      response_type: 'code',
    });

    if (tokenSet.expired()) {
      throw new InvalidOpenIdTokenError('token expired!');
    }
    const { access_token: accessToken } = tokenSet;
    const parsedToken = parseToken(accessToken);

    const {
      aud,
      sub,
      unique_name,
      upn,
    } = tokenSet.claims();

    const email = parsedToken.email != null ? parsedToken.email : upn;
    const uniqueName = parsedToken.uniqueName != null ? parsedToken.uniqueName : unique_name;

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
