import crypto from 'crypto';

import {
  CardinalDirection,
  CentrelineType,
  LocationSelectionType,
  ReportExportMode,
} from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import ObjectUtils from '@/lib/ObjectUtils';
import ArteryDAO from '@/lib/db/ArteryDAO';
import CountDAO from '@/lib/db/CountDAO';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { InvalidReportExportModeError } from '@/lib/error/MoveErrors';
import CompositeId from '@/lib/io/CompositeId';
import { parseCollisionReportId, parseStudyReportId } from '@/lib/reports/ReportIdParser';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * @typedef {Object} StoragePathResponse
 * @property {string} namespace
 * @property {string} key
 */

/**
 * Used to build `namespace` and `key` identifiers for use with {@link StorageStrategyBase}
 * methods.
 */
class StoragePath {
  // TRUNCATE FUNCTION
  static truncateDescription(description, limit) {
    let descriptionTruncated = description;
    while (descriptionTruncated.length > limit) {
      const i = descriptionTruncated.lastIndexOf('/');
      if (i === -1) {
        return descriptionTruncated.slice(0, limit);
      }
      descriptionTruncated = descriptionTruncated.slice(0, i).trim();
    }
    return descriptionTruncated;
  }

  // HELPERS

  /**
   *
   * @param {DateTime} dt
   * @returns {string}
   */
  static getDate(dt) {
    return TimeFormatters.formatCsvDate(dt);
  }

  /**
   *
   * @param {Object} study
   * @returns {string}
   */
  static async getDirectionsFromStudy(study) {
    const [arteries, counts] = await Promise.all([
      ArteryDAO.byStudy(study),
      CountDAO.byStudy(study),
    ]);
    const arteriesByCode = mapBy(arteries, ({ arteryCode }) => arteryCode);
    const countDirections = counts.map(({ arteryCode }) => {
      const artery = arteriesByCode.get(arteryCode);
      return artery.approachDir;
    });
    const directions = CardinalDirection.enumValues.filter(
      direction => countDirections.some(countDirection => countDirection === direction),
    );
    return directions
      .map(({ short }) => `${short}B`)
      .join('_');
  }

  /**
   *
   * @param {string} id
   * @returns {string}
   */
  static getId(id) {
    return id.replace(/[^a-zA-Z0-9-]+/g, '_');
  }

  /**
   *
   * @param {Object} study
   * @returns {string}
   */
  static async getLocationFromStudy(study) {
    const location = await CentrelineDAO.byFeature(study);
    const description = StoragePath.sanitizeLocationDescription(
      location.description,
      StoragePath.MAX_LOCATION_LENGTH,
    );
    if (location.centrelineType === CentrelineType.SEGMENT) {
      const partDirections = await StoragePath.getDirectionsFromStudy(study);
      return `${description}_${partDirections}`;
    }
    return description;
  }

  /**
   *
   * @param {Object} data
   * @returns {string}
   */
  static async getLocationsSelection(data) {
    const { s1, selectionType } = data;
    const features = CompositeId.decode(s1);
    const locations = await CentrelineDAO.byFeatures(features);

    const n = locations.length;
    let descriptionFirst = StoragePath.sanitizeLocationDescription(
      locations[0].description,
      StoragePath.MAX_LOCATION_LENGTH,
    );
    if (n === 1) {
      return descriptionFirst;
    }
    if (selectionType === LocationSelectionType.POINTS) {
      if (n === 2) {
        return StoragePath.sanitizeLocationDescription(
          `${descriptionFirst} + 1 location`,
          StoragePath.MAX_LOCATIONS_SELECTION_LENGTH,
        );
      }
      return StoragePath.sanitizeLocationDescription(
        `${descriptionFirst} + ${n - 1} locations`,
        StoragePath.MAX_LOCATIONS_SELECTION_LENGTH,
      );
    }

    let descriptionLast = StoragePath.sanitizeLocationDescription(
      locations[n - 1].description,
      StoragePath.MAX_LOCATION_LENGTH,
    );
    const limit = (StoragePath.MAX_LOCATIONS_SELECTION_LENGTH - 2) / 2;
    if (descriptionFirst.length + descriptionLast.length > limit * 2) {
      descriptionFirst = StoragePath.sanitizeLocationDescription(
        locations[0].description,
        limit,
      );
      descriptionLast = StoragePath.sanitizeLocationDescription(
        locations[n - 1].description,
        limit,
      );
    }
    return `${descriptionFirst}--${descriptionLast}`;
  }

  /**
   *
   * @param {Object} options
   * @returns {string}
   */
  static getOptionsHash(options) {
    if (ObjectUtils.isEmpty(options)) {
      return '';
    }
    const hashBuilder = crypto.createHash('md5');
    hashBuilder.update(JSON.stringify(options));
    const hash = hashBuilder.digest('hex').slice(0, 8);
    return `_${hash}`;
  }

  /**
   *
   * @param {Array<StoragePathResponse>} storagePaths
   * @returns {string}
   */
  static getReportHash(storagePaths) {
    const hashBuilder = crypto.createHash('md5');
    const n = storagePaths.length;
    for (let i = 0; i < n; i++) {
      const { key: reportKey } = storagePaths[i];
      hashBuilder.update(reportKey, 'utf8');
    }
    return hashBuilder.digest('hex').slice(0, 8);
  }

  /**
   *
   * @param {ReportType} type
   * @returns {string}
   */
  static getReportType(type) {
    return type.name;
  }

  /**
   *
   * @param {Array<StoragePathResponse>} storagePaths
   * @returns {string}
   */
  static getTotalReports(storagePaths) {
    return `${storagePaths.length}_TOTAL`;
  }

  /**
   *
   * @param {string} description
   * @returns {string}
   */
  static sanitizeLocationDescription(description, limit) {
    const descriptionReplaced = description
      .replace('+', 'plus')
      .replace(' \u2013 ', '-')
      .replace(' \u2192 ', '--');

    const descriptionTruncated = StoragePath.truncateDescription(descriptionReplaced, limit);
    return descriptionTruncated
      .replace(/[^a-zA-Z0-9-]+/g, '_')
      .toUpperCase();
  }

  // REPORT PATH GENERATORS

  // TODO: add MVCR here

  /**
   *
   * @param {Object} report
   * @returns {StoragePathResponse} storage path for given collision report
   */
  static async forCollisionReport(report) {
    const {
      type,
      id,
      format,
      ...options
    } = report;

    const partReportType = StoragePath.getReportType(type);
    const { s1, selectionType } = await parseCollisionReportId(id);
    const partLocationsSelection = await StoragePath.getLocationsSelection({ s1, selectionType });
    const partId = StoragePath.getId(id);
    const partOptionsHash = StoragePath.getOptionsHash(options);
    const { extension } = format;
    const key = `${partReportType}_${partLocationsSelection}_${partId}${partOptionsHash}.${extension}`;
    return { namespace: StoragePath.NAMESPACE_REPORTS_COLLISION, key };
  }

  /**
   *
   * @param {Object} report
   * @returns {StoragePathResponse} storage path for given study report
   */
  static async forStudyReport(report) {
    const {
      type,
      id,
      format,
      ...options
    } = report;

    const partReportType = StoragePath.getReportType(type);
    const { study } = await parseStudyReportId(type, id);
    const partLocation = await StoragePath.getLocationFromStudy(study);
    const partStartDate = StoragePath.getDate(study.startDate);
    const partId = StoragePath.getId(id);
    const partOptionsHash = StoragePath.getOptionsHash(options);
    const { extension } = format;
    const key = `${partReportType}_${partLocation}_${partStartDate}_${partId}${partOptionsHash}.${extension}`;
    return { namespace: StoragePath.NAMESPACE_REPORTS_STUDY, key };
  }

  /**
   *
   * @param {Object} report
   * @returns {StoragePathResponse} storage path for given report
   */
  static async forReport(report) {
    const { type } = report;
    if (type.reportExportMode === ReportExportMode.COLLISIONS) {
      return StoragePath.forCollisionReport(report);
    }
    if (type.reportExportMode === ReportExportMode.STUDIES) {
      return StoragePath.forStudyReport(report);
    }
    throw new InvalidReportExportModeError(type.reportExportMode);
  }

  /**
   *
   * @param {Object} data
   * @param {Array<StoragePathResponse>} storagePaths
   * @returns {StoragePathResponse} storage path for given collision report archive
   */
  static async forCollisionReportZip(data, storagePaths) {
    const { s1, selectionType } = data;
    const id = `${s1}/${selectionType.name}`;
    const partId = StoragePath.getId(id);
    const partReportHash = StoragePath.getReportHash(storagePaths);
    const key = `COLLISION_${partId}_${partReportHash}.zip`;
    return { namespace: StoragePath.NAMESPACE_REPORTS_COLLISION, key };
  }

  /**
   *
   * @param {Object} data
   * @param {Array<StoragePathResponse>} storagePaths
   * @returns {StoragePathResponse} storage path for given study report archive
   */
  static async forStudyReportZip(data, storagePaths) {
    const { s1, selectionType } = data;
    const id = `${s1}/${selectionType.name}`;
    const partId = StoragePath.getId(id);
    const partReportHash = StoragePath.getReportHash(storagePaths);
    const key = `STUDY_${partId}_${partReportHash}.zip`;
    return { namespace: StoragePath.NAMESPACE_REPORTS_STUDY, key };
  }

  /**
   *
   * @param {Object} data - data provided during job creation
   * @param {Array<StoragePathResponse>} storagePaths - storage paths previously generated via
   * {@link StoragePath.forReport}
   * @returns {StoragePathResponse} storage path for given report ZIP archive
   */
  static async forReportZip(data, storagePaths) {
    const { reportExportMode } = data;
    if (reportExportMode === ReportExportMode.COLLISIONS) {
      return StoragePath.forCollisionReportZip(data, storagePaths);
    }
    if (reportExportMode === ReportExportMode.STUDIES) {
      return StoragePath.forStudyReportZip(data, storagePaths);
    }
    throw new InvalidReportExportModeError(reportExportMode);
  }
}
/**
 * @type {number}
 */
StoragePath.MAX_LOCATION_LENGTH = 80;

/**
 * @type {number}
 */
StoragePath.MAX_LOCATIONS_SELECTION_LENGTH = 100;

/**
 * @type {string}
 */
StoragePath.NAMESPACE_REPORTS_COLLISION = 'reportsCollision';

/**
 * @type {string}
 */
StoragePath.NAMESPACE_REPORTS_STUDY = 'reportsStudy';

export default StoragePath;
