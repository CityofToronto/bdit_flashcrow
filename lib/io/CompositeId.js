import { Base64 } from 'js-base64';

import { CentrelineType } from '@/lib/Constants';
import { InvalidCompositeIdError } from '@/lib/error/MoveErrors';
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
    const parts = compositeId.split(':');
    if (parts.length !== 2) {
      throw new InvalidCompositeIdError(compositeId);
    }
    const [type, b64] = parts;
    if (type !== 's1') {
      throw new InvalidCompositeIdError(compositeId);
    }
    const bytes = Base64.toUint8Array(b64, true);
    const bitStream = new BitStream(bytes);

    const n = bitStream.read(16);
    const features = new Array(n);
    for (let i = 0; i < n; i++) {
      const featureType = bitStream.read(1);
      const centrelineType = featureType === 0
        ? CentrelineType.INTERSECTION
        : CentrelineType.SEGMENT;
      const centrelineId = bitStream.read(29);
      features[i] = { centrelineId, centrelineType };
    }

    return features;
  }

  static encode(features) {
    const n = features.length;
    const numBytes = 2 + Math.ceil(n * 30 / 8);
    const bytes = new Uint8Array(numBytes);
    const bitStream = new BitStream(bytes);

    bitStream.write(16, n);
    for (let i = 0; i < n; i++) {
      const { centrelineId, centrelineType } = features[i];
      const featureType = centrelineType === CentrelineType.INTERSECTION ? 0 : 1;
      bitStream.write(1, featureType);
      bitStream.write(29, centrelineId);
    }
    bitStream.end();

    const b64 = Base64.fromUint8Array(bytes, true);
    return `s1:${b64}`;
  }
}

export default CompositeId;
