import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { InvalidCssVariableError } from '@/lib/error/MoveErrors';

/**
 * @typedef {Object} CssVariableDeclaration
 * @property {string} name - name of variable
 * @property {number|string} value - value of variable
 */

/**
 * Parses CSS variables from `web/components/tds.postcss`.
 */
class FormatCss {
  /**
   * Matches the given line against `FormatCss` regexes.
   *
   * @param {string} line - a single line of CSS
   * @returns {?CssVariableDeclaration} the corresponding CSS variable declaration,
   * or `null` if none of the `FormatCss` regexes match
   */
  static getVariableDeclarationFromLine(line) {
    let match = FormatCss.REGEX_COLOR.exec(line);
    if (match !== null) {
      const { groups: { name, value } } = match;
      return { name, value };
    }

    match = FormatCss.REGEX_FONT_SIZE.exec(line);
    if (match !== null) {
      const { groups: { name, value: rawValue } } = match;
      let value = parseFloat(rawValue);
      if (Number.isNaN(value)) {
        return null;
      }
      value *= FormatCss.PT_PER_REM;
      return { name, value };
    }

    match = FormatCss.REGEX_SPACE.exec(line);
    if (match !== null) {
      const { groups: { name, value: rawValue } } = match;
      let value = parseFloat(rawValue);
      if (Number.isNaN(value)) {
        return null;
      }
      value *= FormatCss.PT_PER_REM;
      return { name, value };
    }
    return null;
  }

  /**
   * Initializes `FormatCss.vars` from `tds.postcss`.
   *
   * @returns {Promise<undefined>}
   */
  static async init() {
    if (FormatCss.vars !== null) {
      return Promise.resolve();
    }
    FormatCss.vars = new Map();
    return new Promise((resolve, reject) => {
      try {
        const tdsPostcssPath = path.resolve(
          __dirname,
          '../../../web/components/tds/tds.postcss',
        );
        const tdsPostcss = readline.createInterface({
          input: fs.createReadStream(tdsPostcssPath),
        });
        tdsPostcss.on('line', (line) => {
          const variableDeclaration = FormatCss.getVariableDeclarationFromLine(line);
          if (variableDeclaration !== null) {
            const { name, value } = variableDeclaration;
            FormatCss.vars.set(name, value);
          }
        });
        tdsPostcss.on('close', resolve);
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Gets the value of the CSS variable with the given name.
   *
   * This is deliberately named to match `var(--var-name)` syntax
   * in CSS3.
   *
   * @param {string} name - CSS variable to get value for
   * @returns {number|string} value
   * @throws {InvalidCssVariableError} if no such variable exists
   */
  static var(name) {
    if (!FormatCss.vars.has(name)) {
      throw new InvalidCssVariableError(name);
    }
    return FormatCss.vars.get(name);
  }
}

/**
 * In our CSS, `1rem` is `16px`.  A CSS pixel is 1/96 inches, while a PDF
 * point is 1/72 inches - so `16px` is `12pt`.
 *
 * @type {number}
 * @see https://webplatform.github.io/docs/tutorials/understanding-css-units/
 */
FormatCss.PT_PER_REM = 12;

/**
 * Matches CSS color-valued variable declarations.  For instance,
 * `--primary-lighter: #d9e8f6` becomes
 * `{ name: '--primary-lighter', value: '#d9e8f6' }`
 *
 * @type {RegExp}
 */
FormatCss.REGEX_COLOR = /^ {2}(?<name>--[a-z0-9-]+): (?<value>#[0-9a-f]+);/;

/**
 * Matches CSS font size variable declarations.  For instance,
 * `--font-size-xs: 0.75rem;` becomes
 * `{ name: '--font-size-xs', value: '0.75' }`
 *
 * @type {RegExp}
 */
FormatCss.REGEX_FONT_SIZE = /^ {2}(?<name>--font-size-[a-z0-9]+): (?<value>[0-9.]+)rem;/;


/**
 * Matches CSS spacing variable declarations.  For instance,
 * `--space-2xl: 4rem;` becomes
 * `{ name: '--space-2xl', value: '4' }`
 *
 * @type {RegExp}
 */
FormatCss.REGEX_SPACE = /^ {2}(?<name>--space-[a-z0-9]+): (?<value>[0-9.]+)rem;/;


/**
 * Mapping from CSS color-valued variable names (including the `--`, to
 * make it clear that these are CSS variables) to their color values.
 *
 * @type {Map<string, string>}
 */
FormatCss.vars = null;

export default FormatCss;
