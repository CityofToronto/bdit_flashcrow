import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { InvalidCssVariableError } from '@/../lib/error/MoveErrors';

const CSS_COLOR_REGEX = /^ {2}(?<name>--[a-z0-9-]+): (?<value>#[0-9a-f]+);/;

class FormatColors {
  static async init() {
    FormatColors.vars = new Map();
    return new Promise((resolve, reject) => {
      try {
        const tdsPostcssPath = path.resolve(
          __dirname,
          '../../src/components/tds/tds.postcss',
        );
        const tdsPostcss = readline.createInterface({
          input: fs.createReadStream(tdsPostcssPath),
        });
        tdsPostcss.on('line', (line) => {
          const match = CSS_COLOR_REGEX.exec(line);
          if (match !== null) {
            const { groups: { name, value } } = match;
            FormatColors.vars.set(name, value);
          }
        });
        tdsPostcss.on('close', resolve);
      } catch (err) {
        reject(err);
      }
    });
  }

  static async var(name) {
    if (FormatColors.vars === null) {
      await FormatColors.init();
    }
    if (!FormatColors.vars.has(name)) {
      throw new InvalidCssVariableError(name);
    }
    return FormatColors.vars.get(name);
  }
}
FormatColors.vars = null;

export default FormatColors;
