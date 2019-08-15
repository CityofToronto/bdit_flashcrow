import { Issuer } from 'openid-client';

import config from '../config/MoveConfig';

const BASE_URL = 'https://accounts.google.com';
let CLIENT = null;

class OpenIDClient {
  static async get() {
    if (CLIENT === null) {
      const issuer = await Issuer.discover(BASE_URL);
      CLIENT = new issuer.Client(config.openid);
    }
    return CLIENT;
  }
}

export default OpenIDClient;
