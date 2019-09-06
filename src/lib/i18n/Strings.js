/**
 * A specific string (message) used in MOVE.  These are most commonly used for
 * various notifications and alerts, e.g. via `setToast()`.
 *
 * TODO: several of these could use parameterized versions!
 *
 * @typedef {object} StringMessage
 * @property {string} variant - `success`, `info`, `warning`, `error` depending on severity
 * @property {string} text - text of the message
 */

/**
 * Used for studies within a study request that do not have additional notes.
 *
 * @memberof Strings
 * @type {StringMessage}
 */
const COUNT_NO_ADDITIONAL_NOTES = {
  variant: 'info',
  text: 'No additional notes.',
};

/**
 * Used when the user attempts to load details for a study request that they
 * do not have permission to view (e.g. because it belongs to another user,
 * and they are not an admin of the request queue).
 *
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_FORBIDDEN = {
  variant: 'error',
  text: 'You do not have access to this study request.',
};

/**
 * Used when the user attempts to load details for a study request that does
 * not exist.
 *
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_NOT_FOUND = {
  variant: 'error',
  text: 'Could not find study request.',
};

/**
 * Used when the user has not yet selected a location in View Map, and tries
 * to initiate the Request Study flow.
 *
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_REQUIRES_LOCATION = {
  variant: 'warning',
  text: 'Please select a location before requesting a study.',
};

/**
 * Used when the user is not logged in, and tries to view a page that expects
 * an authenticated user.
 *
 * @memberof Strings
 * @type {StringMessage}
 */
const ROUTE_NOT_LOGGED_IN = {
  variant: 'warning',
  text: 'You must be logged in to view that page.',
};

/**
 * `Strings` is effectively a manifest of strings (messages) used in MOVE.
 * @type {object<string, StringMessage>}
 */
const Strings = {
  COUNT_NO_ADDITIONAL_NOTES,
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
  REQUEST_STUDY_REQUIRES_LOCATION,
  ROUTE_NOT_LOGGED_IN,
};

export {
  Strings as default,
  COUNT_NO_ADDITIONAL_NOTES,
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
  REQUEST_STUDY_REQUIRES_LOCATION,
  ROUTE_NOT_LOGGED_IN,
};
