/**
 * A specific string (message) used in MOVE.  These are most commonly used for
 * various notifications and alerts.
 *
 * @typedef {object} StringMessage
 * @property {string} variant - `success`, `info`, `warning`, `error` depending on severity
 * @property {string} text - text of the message
 */

const COUNT_NO_ADDITIONAL_NOTES = {
  variant: 'info',
  text: 'No additional notes.',
};

const REQUEST_STUDY_FORBIDDEN = {
  variant: 'error',
  text: 'You do not have access to this study request.',
};

const REQUEST_STUDY_NOT_FOUND = {
  variant: 'error',
  text: 'Could not find study request.',
};

const REQUEST_STUDY_REQUIRES_LOCATION = {
  variant: 'warning',
  text: 'Please select a location before requesting a study.',
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
};

export {
  Strings as default,
  COUNT_NO_ADDITIONAL_NOTES,
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
  REQUEST_STUDY_REQUIRES_LOCATION,
};
