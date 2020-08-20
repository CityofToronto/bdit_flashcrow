import fs from 'fs';
import https from 'https';
import path from 'path';

const ca = fs.readFileSync(path.join(__dirname, '..', '..', 'ssl', 'ca.pem'));
export default new https.Agent({ ca });
