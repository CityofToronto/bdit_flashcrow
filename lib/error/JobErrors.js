/**
 * Thrown by {@link JobRunnerFactory.getInstance} for invalid job types.
 *
 * @memberof JobErrors
 * @see {@link JobRunnerFactory.getInstance}
 */
class InvalidJobTypeError extends Error {}

/**
 * Namespace for MOVE application errors related to background jobs.
 *
 * @namespace
 */
const JobErrors = {
  InvalidJobTypeError,
};

export {
  JobErrors as default,
  InvalidJobTypeError,
};
