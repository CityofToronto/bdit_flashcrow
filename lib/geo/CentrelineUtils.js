import {
  CentrelineType,
  RoadIntersectionType,
  RoadSegmentType,
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

const CentrelineUtils = {
  getLocationFeatureType,
  getLocationsDescription,
  getLocationsWaypointIndices,
};

export {
  CentrelineUtils as default,
  getLocationFeatureType,
  getLocationsDescription,
  getLocationsWaypointIndices,
};
