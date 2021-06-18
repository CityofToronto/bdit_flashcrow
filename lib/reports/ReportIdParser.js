/* eslint-disable class-methods-use-this */
import { LocationSelectionType, StudyType } from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import StudyDAO from '@/lib/db/StudyDAO';
import {
  EnumValueError,
  InvalidCompositeIdError,
  InvalidFeaturesSelectionError,
  InvalidReportIdError,
} from '@/lib/error/MoveErrors';
import FeatureResolver from '@/lib/geo/FeatureResolver';
import CompositeId from '@/lib/io/CompositeId';

async function parseCollisionReportId(rawId) {
  const parts = rawId.split('/');
  if (parts.length !== 2) {
    throw new InvalidReportIdError(`invalid number of parts: ${rawId}`);
  }

  const s1 = parts.shift();
  let features;
  try {
    features = CompositeId.decode(s1);
  } catch (err) {
    if (err instanceof InvalidCompositeIdError) {
      throw new InvalidReportIdError(`invalid s1: ${rawId}`);
    }
    throw err;
  }

  const selectionTypeStr = parts.shift();
  let selectionType;
  try {
    selectionType = LocationSelectionType.enumValueOf(selectionTypeStr);
  } catch (err) {
    if (err instanceof EnumValueError) {
      throw new InvalidReportIdError(`invalid selectionType: ${rawId}`);
    }
    throw err;
  }

  let locations = await CentrelineDAO.byFeatures(features);
  locations = locations.filter(location => location !== null);
  const locationsSelection = { locations, selectionType };

  const featuresSelection = { features, selectionType };
  try {
    features = await FeatureResolver.byFeaturesSelection(featuresSelection);
  } catch (err) {
    if (err instanceof InvalidFeaturesSelectionError) {
      throw new InvalidReportIdError(`could not route location selection: ${rawId}`);
    }
    throw err;
  }

  return {
    features,
    locationsSelection,
    s1,
    selectionType,
  };
}

async function parseStudyReportId(reportType, rawId) {
  const parts = rawId.split('/');
  if (parts.length !== 2) {
    throw new InvalidReportIdError(`invalid number of parts: ${rawId}`);
  }

  const studyTypeName = parts.shift();
  let studyType;
  try {
    studyType = StudyType.enumValueOf(studyTypeName);
  } catch (err) {
    if (err instanceof EnumValueError) {
      throw new InvalidReportIdError(`invalid studyType: ${rawId}`);
    }
    throw err;
  }

  let countGroupId = parts.shift();
  countGroupId = parseInt(countGroupId, 10);
  if (Number.isNaN(countGroupId)) {
    throw new InvalidReportIdError(`invalid countGroupId: ${rawId}`);
  }

  const study = await StudyDAO.byStudyTypeAndCountGroup(studyType, countGroupId);
  if (study === null) {
    throw new InvalidReportIdError(`study does not exist: ${rawId}`);
  }
  if (study.studyType !== studyType) {
    throw new InvalidReportIdError(`study type mismatch: ${rawId}`);
  }
  if (!study.studyType.reportTypes.includes(reportType)) {
    /*
     * Check if the report type is actually compatible with the given study.
     */
    throw new InvalidReportIdError(`report not available for study: ${rawId}`);
  }
  return {
    countGroupId,
    studyType,
    study,
  };
}

/**
 * @namespace
 */
const ReportIdParser = {
  parseCollisionReportId,
  parseStudyReportId,
};

export {
  ReportIdParser as default,
  parseCollisionReportId,
  parseStudyReportId,
};
