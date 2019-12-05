/*
 * TODO: provide `MoveError` superclass that handles serialization - it can
 * be *very* useful to pass errors from the backend to the frontend in a
 * consistent manner.
 */

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
  EnumInstantiationError,
  EnumValueError,
  InvalidCentrelineTypeError,
  InvalidCssVariableError,
  InvalidDynamicTileLayerError,
  InvalidReportFormatError,
  InvalidReportIdError,
  InvalidReportTypeError,
  NotImplementedError,
};

export {
  MoveErrors as default,
  EnumInstantiationError,
  EnumValueError,
  InvalidCentrelineTypeError,
  InvalidCssVariableError,
  InvalidDynamicTileLayerError,
  InvalidReportFormatError,
  InvalidReportIdError,
  InvalidReportTypeError,
  NotImplementedError,
};
