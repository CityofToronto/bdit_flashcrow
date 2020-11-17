/*
 * TODO: provide `MoveError` superclass that handles serialization - it can
 * be *very* useful to pass errors from the backend to the frontend in a
 * consistent manner.
 */

/**
 * Thrown by {@link BitStream} methods when attempting to write past capacity, when
 * attempting to read or seek past length, or when attempting to seek to a negative
 * bit index.
 *
 * @memberof MoveErrors
 * @see BitStream
 */
class BitStreamOverflowError extends Error {}

/**
 * Thrown by {@link BitStream.fromString} when attempting to deserialize an invalid
 * `BitStream` string.
 *
 * @memberof MoveErrors
 * @see BitStream.fromString
 */
class BitStreamSerializationError extends Error {}

/**
 * Thrown by {@link ClassUtils.Enum} when attempting to instantiate an `Enum` class
 * after calling `Enum.init`.
 *
 * @memberof MoveErrors
 * @see ClassUtils.Enum
 */
class EnumInstantiationError extends Error {}

/**
 * Thrown by {@link ClassUtils.Enum} when attempting to call `Enum.enumValueOf` with
 * a `name` for which there is no value.  Also thrown in `if` / `switch` clauses as
 * a fallback / `default` when an enum value is invalid.
 *
 * @memberof MoveErrors
 * @see ClassUtils.Enum
 */
class EnumValueError extends Error {}

/**
 * Thrown by various methods (e.g. in {@link CentrelineDAO}) when passed
 * an invalid {@link CentrelineType}.
 *
 * @memberof MoveErrors
 * @see CentrelineDAO
 * @see CentrelineType
 */
class InvalidCentrelineTypeError extends Error {}

/**
 * Thrown by {@link CollisionDAO} methods when passed an invalid collision
 * query.
 */
class InvalidCollisionQueryError extends Error {}

/**
 * Thrown by {@link CompositeId.decode} for invalid composite IDs.
 *
 * @memberof MoveErrors
 * @see DynamicTileDAO.getTileFeatures
 */
class InvalidCompositeIdError extends Error {}

/**
 * Thrown by {@link FormatColors.var} for unknown variables.
 *
 * @memberof MoveErrors
 * @see FormatColors.var
 */
class InvalidCssVariableError extends Error {}

/**
 * Thrown by {@link DynamicTileDAO.getTileFeatures} for invalid layer names.
 *
 * @memberof MoveErrors
 * @see DynamicTileDAO.getTileFeatures
 */
class InvalidDynamicTileLayerError extends Error {}

/**
 * Thrown by {@link FeatureResolver.byFeaturesSelection} methods for selections
 * that contain too many features, that cannot be resolved, or that resolve to
 * too many features.
 *
 * @memberof MoveErrors
 * @see FeatureResolver.byFeaturesSelection
 */
class InvalidFeaturesSelectionError extends Error {}

/**
 * Thrown by {@link OpenIdClient#callback} for invalid OpenID Connect identity tokens.
 *
 * @memberof MoveErrors
 * @see OpenIdClient#callback
 */
class InvalidOpenIdTokenError extends Error {}

/**
 * Thrown by {@link StoragePath} methods for invalid report export modes.
 *
 * @memberof MoveErrors
 * @see StoragePath
 */
class InvalidReportExportModeError extends Error {}

/**
 * Thrown by {@link ReportBase#generate} for invalid report formats.
 *
 * @memberof MoveErrors
 * @see ReportBase#generate
 */
class InvalidReportFormatError extends Error {}

/**
 * Thrown by {@link ReportBase#parseId} for invalid report IDs.
 *
 * @memberof MoveErrors
 * @see ReportBase#parseId
 */
class InvalidReportIdError extends Error {}

/**
 * Thrown by {@link ReportFactory#getInstance} for invalid report types.
 *
 * @memberof MoveErrors
 * @see ReportFactory#getInstance
 */
class InvalidReportTypeError extends Error {}

/**
 * Thrown by {@link StudyDAO} methods when passed an invalid study query.
 */
class InvalidStudyQueryError extends Error {}

/**
 * Thrown by abstract superclass methods.
 *
 * @memberof MoveErrors
 */
class NotImplementedError extends Error {}

/**
 * Namespace for MOVE application errors.
 *
 * @namespace
 */
const MoveErrors = {
  BitStreamOverflowError,
  BitStreamSerializationError,
  EnumInstantiationError,
  EnumValueError,
  InvalidCentrelineTypeError,
  InvalidCollisionQueryError,
  InvalidCompositeIdError,
  InvalidCssVariableError,
  InvalidDynamicTileLayerError,
  InvalidFeaturesSelectionError,
  InvalidOpenIdTokenError,
  InvalidReportExportModeError,
  InvalidReportFormatError,
  InvalidReportIdError,
  InvalidReportTypeError,
  InvalidStudyQueryError,
  NotImplementedError,
};

export {
  MoveErrors as default,
  BitStreamOverflowError,
  BitStreamSerializationError,
  EnumInstantiationError,
  EnumValueError,
  InvalidCentrelineTypeError,
  InvalidCollisionQueryError,
  InvalidCompositeIdError,
  InvalidCssVariableError,
  InvalidDynamicTileLayerError,
  InvalidFeaturesSelectionError,
  InvalidOpenIdTokenError,
  InvalidReportExportModeError,
  InvalidReportFormatError,
  InvalidReportIdError,
  InvalidReportTypeError,
  InvalidStudyQueryError,
  NotImplementedError,
};
