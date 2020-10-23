import {
  CentrelineType,
  LocationSelectionType,
  RoadIntersectionType,
  RoadSegmentType,
  StudyType,
} from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';

function getLocationFeatureType(location) {
  if (location === null) {
    return null;
  }
  const { centrelineType, featureCode = null } = location;
  if (featureCode === null) {
    return null;
  }
  if (centrelineType === CentrelineType.SEGMENT) {
    return RoadSegmentType.enumValueOf(featureCode, 'featureCode');
  }
  if (centrelineType === CentrelineType.INTERSECTION) {
    return RoadIntersectionType.enumValueOf(featureCode, 'featureCode');
  }
  throw new InvalidCentrelineTypeError(centrelineType);
}

function getLocationStudyTypes(location) {
  const locationFeatureType = getLocationFeatureType(location);
  if (locationFeatureType instanceof RoadIntersectionType) {
    return [StudyType.TMC];
  }
  if (locationFeatureType === RoadSegmentType.EXPRESSWAY) {
    return [StudyType.RESCU];
  }
  if (locationFeatureType === RoadSegmentType.EXPRESSWAY_RAMP) {
    return [
      StudyType.ATR_SPEED_VOLUME,
      StudyType.ATR_VOLUME,
      StudyType.RESCU,
    ];
  }
  if (locationFeatureType === RoadSegmentType.MAJOR_ARTERIAL
    || locationFeatureType === RoadSegmentType.MAJOR_ARTERIAL_RAMP) {
    return [
      StudyType.ATR_SPEED_VOLUME,
      StudyType.ATR_VOLUME,
      StudyType.ATR_VOLUME_BICYCLE,
      StudyType.PED_DELAY,
      StudyType.PXO_OBSERVE,
      StudyType.RESCU,
    ];
  }
  return [
    StudyType.ATR_SPEED_VOLUME,
    StudyType.ATR_VOLUME,
    StudyType.ATR_VOLUME_BICYCLE,
    StudyType.PED_DELAY,
    StudyType.PXO_OBSERVE,
  ];
}

function getLocationsDescription(locations) {
  const n = locations.length;
  if (n === 0) {
    return null;
  }
  const [{ description }] = locations;
  if (n === 1) {
    return description;
  }
  if (n === 2) {
    return `${description} + 1 location`;
  }
  return `${description} + ${n - 1} locations`;
}

function getLocationsCorridorDescription(locations) {
  const n = locations.length;
  if (n === 0) {
    return null;
  }
  const { description: descriptionFirst } = locations[0];
  if (n === 1) {
    return `${descriptionFirst}`;
  }
  const { description: descriptionLast } = locations[n - 1];
  return `${descriptionFirst} \u2192 ${descriptionLast}`;
}

function getLocationsSelectionDescription({ locations, selectionType }) {
  if (selectionType === LocationSelectionType.POINTS) {
    return getLocationsDescription(locations);
  }
  if (selectionType === LocationSelectionType.CORRIDOR) {
    return getLocationsCorridorDescription(locations);
  }
  throw new Error(`invalid selection type: ${selectionType}`);
}

function getLocationsWaypointIndices(locations, waypoints) {
  const n = waypoints.length;
  let waypointIndex = 0;
  let waypoint = waypoints[waypointIndex];
  return locations.map((location) => {
    /*
      * It is possible for the current location to match multiple consecutive waypoints.
      * We could forbid selecting the same location multiple times, but that would introduce
      * a lot of validation complexity in both frontend and backend.  It would also make it
      * impossible to select a corridor that loops back on itself.
      *
      * `waypointIndices` represents the subsequence of `waypoints`, starting at the current
      * `waypointIndex`, that matches the current location.
      */
    const waypointIndices = [];
    while (waypointIndex < n
      && location.centrelineType === waypoint.centrelineType
      && location.centrelineId === waypoint.centrelineId) {
      waypointIndices.push(waypointIndex);
      waypointIndex += 1;
      waypoint = waypoints[waypointIndex];
    }
    return waypointIndices;
  });
}

function getLocationsIconProps(locations, waypoints) {
  const locationsWaypointIndices = getLocationsWaypointIndices(locations, waypoints);
  return locations.map(({ centrelineType }, i) => {
    const midblock = centrelineType === CentrelineType.SEGMENT;
    const waypointIndices = locationsWaypointIndices[i];
    const n = waypointIndices.length;
    if (n === 0) {
      return { locationIndex: -1, midblock };
    }
    const locationIndex = waypointIndices[n - 1];
    return { locationIndex, midblock };
  });
}

/**
 * @namespace
 */
const CentrelineUtils = {
  getLocationFeatureType,
  getLocationStudyTypes,
  getLocationsCorridorDescription,
  getLocationsDescription,
  getLocationsIconProps,
  getLocationsSelectionDescription,
  getLocationsWaypointIndices,
};

export {
  CentrelineUtils as default,
  getLocationFeatureType,
  getLocationStudyTypes,
  getLocationsCorridorDescription,
  getLocationsDescription,
  getLocationsIconProps,
  getLocationsSelectionDescription,
  getLocationsWaypointIndices,
};
