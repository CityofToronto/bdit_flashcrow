import { LocationSelectionType, MAX_LOCATIONS } from '@/lib/Constants';
import RoutingDAO from '@/lib/db/RoutingDAO';
import { InvalidFeaturesSelectionError } from '@/lib/error/MoveErrors';
import CompositeId from '@/lib/io/CompositeId';

class FeatureResolver {
  static async byFeaturesSelection(featuresSelection) {
    const { features, selectionType } = featuresSelection;
    if (features.length > MAX_LOCATIONS) {
      throw new InvalidFeaturesSelectionError(
        `cannot route corridor on more than ${MAX_LOCATIONS} locations`,
      );
    }

    if (selectionType === LocationSelectionType.CORRIDOR) {
      const corridor = await RoutingDAO.routeCorridor(features);
      if (corridor === null) {
        throw new InvalidFeaturesSelectionError(
          'no corridor found on the given location selection',
        );
      }
      if (corridor.length > CompositeId.MAX_FEATURES) {
        throw new InvalidFeaturesSelectionError(
          `cannot return corridor with more than ${CompositeId.MAX_FEATURES} locations`,
        );
      }
      return corridor;
    }

    return features;
  }
}

export default FeatureResolver;
