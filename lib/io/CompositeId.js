import { CentrelineType } from '@/lib/Constants';
import {
  BitStreamOverflowError,
  BitStreamSerializationError,
  InvalidCompositeIdError,
} from '@/lib/error/MoveErrors';
import BitStream from '@/lib/io/BitStream';

/**
 * A `CompositeId` is a single identifier representing a sequence of objects, such as
 * features within a selection or reports in a ZIP file.  It encodes the identifiers
 * of those objects into a single URL-friendly string of format `{type}:{value}`,
 * where `type` is a string that identifies a `CompositeIdType`.
 *
 * `value` here is a `base64url`-encoded {@link BitStream} that contains a
 * packed representation of the individual object IDs.  Note that the `CompositeId`
 * does not contain objects, but only ID references to those objects.  It is intended
 * to be used with methods and/or REST API requests that resolve those ID references
 * to their full objects, such as `WebApi.getLocationsByFeature`.
 */
class CompositeId {
  static decode(compositeId) {
    const typeSeparatorIndex = compositeId.indexOf(':');
    if (typeSeparatorIndex === -1) {
      throw new InvalidCompositeIdError(`invalid structure: ${compositeId}`);
    }
    const type = compositeId.slice(0, typeSeparatorIndex);
    if (type !== 's1') {
      throw new InvalidCompositeIdError(`invalid type: ${compositeId}`);
    }
    const str = compositeId.slice(typeSeparatorIndex + 1);
    try {
      const bitStream = BitStream.fromString(str);
      const n = bitStream.bitLength / CompositeId.BITS_PER_FEATURE;
      if (!Number.isInteger(n)) {
        throw new InvalidCompositeIdError(`invalid bit length: ${bitStream.bitLength}`);
      }

      const features = new Array(n);
      for (let i = 0; i < n; i++) {
        const featureType = bitStream.read(1);
        const centrelineType = featureType === 0
          ? CentrelineType.INTERSECTION
          : CentrelineType.SEGMENT;
        const centrelineId = bitStream.read(CompositeId.BITS_PER_FEATURE - 1);
        features[i] = { centrelineId, centrelineType };
      }

      return features;
    } catch (err) {
      if (err instanceof BitStreamOverflowError) {
        throw new InvalidCompositeIdError(err);
      } else if (err instanceof BitStreamSerializationError) {
        throw new InvalidCompositeIdError(err);
      } else {
        throw err;
      }
    }
  }

  static encode(features) {
    const n = features.length;
    const numBytes = Math.ceil(n * CompositeId.BITS_PER_FEATURE / 8);
    const bytes = new Uint8Array(numBytes);
    const bitStream = new BitStream(bytes);

    for (let i = 0; i < n; i++) {
      const { centrelineId, centrelineType } = features[i];
      const featureType = centrelineType === CentrelineType.INTERSECTION ? 0 : 1;
      bitStream.write(1, featureType);
      bitStream.write(CompositeId.BITS_PER_FEATURE - 1, centrelineId);
    }

    const str = bitStream.toString();
    return `s1:${str}`;
  }
}
CompositeId.BITS_PER_FEATURE = 30;

export default CompositeId;
