import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { InvalidCssVariableError } from '@/../lib/error/MoveErrors';

/**
 * Parses CSS color-valued variables from `src/components/tds.postcss`
 */
class FormatColors {
  /**
   * Initializes `FormatColors.vars` from `tds.postcss`.
   *
   * @returns {Promise<undefined>}
   */
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
          const match = FormatColors.CSS_COLOR_REGEX.exec(line);
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

  /**
   * Gets the color value of the CSS variable with the given name.
   *
   * This is deliberately named to match `var(--var-name)` syntax
   * in CSS3.
   *
   * @param {string} name - CSS variable to get color value for
   * @returns {Promise<string>} color value
   * @throws {InvalidCssVariableError} if no such variable exists
   */
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

/**
 * Matches CSS color-valued variable declarations.  For instance,
 * `--primary-lighter: #d9e8f6` becomes
 * `{ name: '--primary-lighter', value: '#d9e8f6' }`
 *
 * @type {RegExp}
 */
FormatColors.CSS_COLOR_REGEX = /^ {2}(?<name>--[a-z0-9-]+): (?<value>#[0-9a-f]+);/;

/**
 * Mapping from CSS color-valued variable names (including the `--`, to
 * make it clear that these are CSS variables) to their color values.
 *
 * @type {Map<string, string>}
 */
FormatColors.vars = null;

export default FormatColors;
