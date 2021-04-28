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
    throw new InvalidReportIdError(rawId);
  }

  const s1 = parts.shift();
  let features;
  try {
    features = CompositeId.decode(s1);
  } catch (err) {
    if (err instanceof InvalidCompositeIdError) {
      throw new InvalidReportIdError(rawId);
    }
    throw err;
  }

  const selectionTypeStr = parts.shift();
  let selectionType;
  try {
    selectionType = LocationSelectionType.enumValueOf(selectionTypeStr);
  } catch (err) {
    if (err instanceof EnumValueError) {
      throw new InvalidReportIdError(rawId);
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
      throw new InvalidReportIdError(rawId);
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

async function parseStudyReportId(type, rawId) {
  const parts = rawId.split('/');
  if (parts.length !== 2) {
    throw new InvalidReportIdError(rawId);
  }

  let categoryId = parts.shift();
  categoryId = parseInt(categoryId, 10);
  if (Number.isNaN(categoryId)) {
    throw new InvalidReportIdError(rawId);
  }

  let countGroupId = parts.shift();
  countGroupId = parseInt(countGroupId, 10);
  if (Number.isNaN(countGroupId)) {
    throw new InvalidReportIdError(rawId);
  }

  const study = await StudyDAO.byCategoryAndCountGroup(categoryId, countGroupId);
  if (study === null) {
    throw new InvalidReportIdError(rawId);
  }
  const { studyType } = study.type;
  const { speedRelated, tmcRelated } = type;
  if (speedRelated) {
    /*
     * Speed reports MUST have speed data, as the speed class calculations depend on it.
     * Without that, many of those calculations will return `NaN`.
     */
    if (studyType !== StudyType.ATR_SPEED_VOLUME) {
      throw new InvalidReportIdError(rawId);
    }
  } else if (tmcRelated) {
    /*
     * TMC reports MUST have TMC data, as the various turning movement totals depend on it.
     * Without that, many of those calculations will return `NaN`.
     */
    if (studyType !== StudyType.TMC) {
      throw new InvalidReportIdError(rawId);
    }
  } else if (studyType === StudyType.TMC) {
    /*
     * Other reports MUST NOT have TMC data, as they expect data in the volume-data format
     * in `"TRAFFIC"."CNT_DET"`.
     */
    throw new InvalidReportIdError(rawId);
  }
  return {
    categoryId,
    countGroupId,
    study,
  };
}

async function parseStudyRequestReportId(type, rawId) {
  const parts = rawId.split('/');
  if (parts.length !== 2) {
    throw new InvalidReportIdError(rawId);
  }

  const idType = parts.shift();
  if (idType === 'ids') {
    const studyRequestIdsStr = parts.shift();
    const ids = [];
    const idStrs = studyRequestIdsStr.split(',');
    idStrs.forEach((idStr) => {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(idStr)) {
        throw new InvalidReportIdError(rawId);
      }
      ids.push(id);
    });
    return {
      ids,
      uuid: null,
    };
  }
  if (idType === 'uuid') {
    const uuid = parts.shift();
    return {
      ids: null,
      uuid,
    };
  }
  throw new InvalidReportIdError(rawId);
}

/**
 * @namespace
 */
const ReportIdParser = {
  parseCollisionReportId,
  parseStudyReportId,
  parseStudyRequestReportId,
};

export {
  ReportIdParser as default,
  parseCollisionReportId,
  parseStudyReportId,
  parseStudyRequestReportId,
};
