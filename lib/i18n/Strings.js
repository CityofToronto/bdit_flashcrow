/**
 * A specific string (message) used in MOVE.  These are most commonly used for
 * various notifications and alerts, e.g. via `setToast()`.
 *
 * @typedef {Object} StringMessage
 * @property {string} variant - `success`, `info`, `warning`, `error` depending on severity
 * @property {string} text - text of the message
 */

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
const REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE = {
  variant: 'info',
  text: 'Please provide a due date in YYYY-MM-DD format for this request',
};

/*
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_PROVIDE_URGENT_REASON = {
  variant: 'info',
  text: 'Please provide additional information that explains why this request is marked as urgent',
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
  text: 'Please select a location before requesting a study',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_REQUIRES_STUDY_TYPE = {
  variant: 'warning',
  text: 'Please select a study type',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER = {
  variant: 'warning',
  text: 'Please enter the study type for this request',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_SUBMITTED = {
  variant: 'success',
  text: 'Your study request has been submitted',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_TIME_TO_FULFILL_SHORT = {
  variant: 'info',
  text: 'Standard turnaround is 2 - 3 months, but timelines may vary',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_UPDATED = {
  variant: 'success',
  text: 'Your study request has been updated',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES = {
  variant: 'error',
  text: 'Please specify study hours',
};

/**
 * @memberof Strings
 * @type {StringMessage}
 */
const REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK = {
  variant: 'error',
  text: 'Please select one or more days of the week',
};

/**
 * `Strings` is effectively a manifest of strings (messages) used in MOVE.
 * @type {object<string, StringMessage>}
 */
const Strings = {
  OPTIONAL,
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
  REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK,
  REQUEST_STUDY_REQUIRES_LOCATION,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER,
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_TIME_TO_FULFILL_SHORT,
  REQUEST_STUDY_UPDATED,
};

export {
  Strings as default,
  OPTIONAL,
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
  REQUEST_STUDY_OTHER_HOURS_REQUIRES_NOTES,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_REQUIRES_DAYS_OF_WEEK,
  REQUEST_STUDY_REQUIRES_LOCATION,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE,
  REQUEST_STUDY_REQUIRES_STUDY_TYPE_OTHER,
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_TIME_TO_FULFILL_SHORT,
  REQUEST_STUDY_UPDATED,
};
