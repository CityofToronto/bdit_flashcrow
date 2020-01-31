/**
 * A specific string (message) used in MOVE.  These are most commonly used for
 * various notifications and alerts, e.g. via `setToast()`.
 *
 * TODO: several of these could use parameterized versions!
 *
 * @typedef {Object} StringMessage
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
 * @memberof Strings
 * @type {StringMessage}
 */
const OPTIONAL = {
  variant: 'info',
  text: 'Optional',
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

/*
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_PROVIDE_URGENT_REASON = {
  variant: 'info',
  text: 'Please provide additional information that explains why this request is marked as urgent.',
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
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_REQUIRES_STUDIES = {
  variant: 'warning',
  text: 'Please request one or more studies.',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_REQUIRES_REASONS = {
  variant: 'warning',
  text: 'Please select one or more reasons for this request.',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_SUBMITTED = {
  variant: 'success',
  text: 'Your study request has been submitted.',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_TIME_TO_FULFILL = {
  variant: 'info',
  text: 'Standard times to request counts are 2 - 3 months. Peak times are April - June and September - November.',
};

/**
 * Used when the user has not yet selected requests to download in Track Requests.
 *
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUESTS_STUDY_DOWNLOAD_NO_SELECTION = {
  variant: 'warning',
  text: 'Please select one or more requests to download.',
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
 * @memberof Strings
 * @type {StringMessage}
 */
const STUDY_OTHER_HOURS_REQUIRES_NOTES = {
  variant: 'error',
  text: 'Please provide additional notes to explain requirements for Other Hours.',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const STUDY_REQUIRES_DAYS_OF_WEEK = {
  variant: 'error',
  text: 'Please select one or more days of the week.',
};

/**
 * `Strings` is effectively a manifest of strings (messages) used in MOVE.
 * @type {object<string, StringMessage>}
 */
const Strings = {
  COUNT_NO_ADDITIONAL_NOTES,
  OPTIONAL,
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_REQUIRES_LOCATION,
  REQUEST_STUDY_REQUIRES_REASONS,
  REQUEST_STUDY_REQUIRES_STUDIES,
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_TIME_TO_FULFILL,
  REQUESTS_STUDY_DOWNLOAD_NO_SELECTION,
  ROUTE_NOT_LOGGED_IN,
  STUDY_OTHER_HOURS_REQUIRES_NOTES,
  STUDY_REQUIRES_DAYS_OF_WEEK,
};

export {
  Strings as default,
  COUNT_NO_ADDITIONAL_NOTES,
  OPTIONAL,
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_REQUIRES_LOCATION,
  REQUEST_STUDY_REQUIRES_REASONS,
  REQUEST_STUDY_REQUIRES_STUDIES,
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_TIME_TO_FULFILL,
  REQUESTS_STUDY_DOWNLOAD_NO_SELECTION,
  ROUTE_NOT_LOGGED_IN,
  STUDY_OTHER_HOURS_REQUIRES_NOTES,
  STUDY_REQUIRES_DAYS_OF_WEEK,
};
