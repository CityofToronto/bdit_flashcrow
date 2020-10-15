import ArrayUtils from '@/lib/ArrayUtils';

/**
 * @typedef {Object} StreetToken
 * @property {number} rank - ranking score (lower is better)
 * @property {string} token - string token, extracted from intersection name
 */

const TOKENS_IGNORED = [
  'C N R',
  'C P R',
  'Hepc',
];

/**
 * Provides a utility method {@link MidblockDescription.get} to build a midblock description
 * from the midblock name and cross intersection names.
 *
 * @see https://www.notion.so/bditto/Midblock-Naming-Implementation-25cc239ffede4b818a972f2870198186
 */
class MidblockDescription {
  /**
   * Returns the "token category" of the given token, used to rank non-main-road street
   * tokens.  Lower values are given higher priority.
   *
   * @param {string} token - token to determine token category of
   * @returns {number} token category
   */
  static getStreetTokenCategory(token) {
    if (TOKENS_IGNORED.includes(token)) {
      return null;
    }
    if (token.endsWith('Trl')) {
      return 1;
    }
    if (token.endsWith('Ramp')) {
      return 2;
    }
    return 0;
  }

  /**
   *
   * @param {string} part - raw string part from `String#split`
   * @param {number} i - index of that part in the original intersection
   * @returns {StreetToken} street token corresponding to that raw string part
   */
  static getStreetToken(part, i) {
    const token = part.trim();
    const tokenCategory = MidblockDescription.getStreetTokenCategory(token);
    if (tokenCategory === null) {
      return null;
    }
    /*
     * We can depend on intersection names having fewer than 100 street tokens; a quick check
     * suggests the maximum number is 4-5.
     */
    return { rank: tokenCategory * 100 + i, token };
  }

  /**
   * Returns street tokens in the given intersection.  Note that this does not filter out the
   * main road; that is done by {@link MidblockDescription.getCrossStreet}.
   *
   * @param {string} intersectionName - cross intersection
   * @returns {Array<StreetToken>} ranked street tokens in the intersection
   */
  static getStreetTokens(intersectionName) {
    return intersectionName
      .split('/')
      .map(MidblockDescription.getStreetToken)
      .filter(token => token !== null);
  }

  /**
   *
   * @param {string} midblockName - main road
   * @param {string?} intersectionName - cross intersection
   * @returns {string} best cross street candidate from `intersectionName`
   */
  static getCrossStreet(midblockName, intersectionName) {
    if (intersectionName === null) {
      return null;
    }
    const streetTokens = MidblockDescription.getStreetTokens(intersectionName);
    const i = streetTokens.findIndex(({ token }) => token === midblockName);
    if (i === -1) {
      return null;
    }
    streetTokens.splice(i, 1);
    if (streetTokens.length === 0) {
      return null;
    }
    const bestStreetToken = ArrayUtils.getMinBy(streetTokens, ({ rank }) => rank);
    return bestStreetToken.token;
  }

  /**
   *
   * @param {string} midblockName - name of the main midblock street (e.g. "Sudbury St")
   * @param {string?} fromIntersectionName - name of the first cross intersection
   * @param {string?} toIntersectionName - name of the second cross intersection
   * @returns {string} midblock description
   */
  static get(midblockName, fromIntersectionName, toIntersectionName) {
    const fromCrossStreet = MidblockDescription.getCrossStreet(midblockName, fromIntersectionName);
    const toCrossStreet = MidblockDescription.getCrossStreet(midblockName, toIntersectionName);
    if (fromCrossStreet === null) {
      if (toCrossStreet === null) {
        return midblockName;
      }
      return `${midblockName}: near ${toCrossStreet}`;
    }
    if (toCrossStreet === null) {
      return `${midblockName}: near ${fromCrossStreet}`;
    }
    return `${midblockName}: ${fromCrossStreet} \u2013 ${toCrossStreet}`;
  }
}

export default MidblockDescription;
