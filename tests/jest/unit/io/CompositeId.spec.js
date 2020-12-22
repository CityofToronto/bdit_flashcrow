import { CentrelineType } from '@/lib/Constants';
import Random from '@/lib/Random';
import { InvalidCompositeIdError } from '@/lib/error/MoveErrors';
import CompositeId from '@/lib/io/CompositeId';

function generateCompositeIdFeature() {
  const centrelineId = Random.range(1, 0x20000000);
  const centrelineType = Random.choice([
    CentrelineType.SEGMENT,
    CentrelineType.INTERSECTION,
  ]);
  return { centrelineId, centrelineType };
}

test('CompositeId [invalid IDs]', () => {
  expect(() => {
    CompositeId.decode('');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('s1');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('s1:');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('s1:QAAA');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('invalidType:blargl');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('s1:AAAAAA');
  }).toThrow(InvalidCompositeIdError);
});

test('CompositeId [length limit decode]', () => {
  const parts = ['s1:A'];
  for (let i = 0; i < CompositeId.MAX_FEATURES; i++) {
    parts.push('CAAAA');
  }
  let compositeId = parts.join('');
  expect(() => {
    CompositeId.decode(compositeId);
  }).not.toThrow(InvalidCompositeIdError);

  parts.push('CAAAA');
  compositeId = parts.join('');
  expect(() => {
    CompositeId.decode(compositeId);
  }).toThrow(InvalidCompositeIdError);
});

test('CompositeId [length limit encode]', () => {
  const features = [];
  let feature;
  for (let i = 0; i < CompositeId.MAX_FEATURES; i++) {
    feature = generateCompositeIdFeature();
    features.push(feature);
  }
  expect(() => {
    CompositeId.encode(features);
  }).not.toThrow(InvalidCompositeIdError);

  feature = generateCompositeIdFeature();
  features.push(feature);
  expect(() => {
    CompositeId.encode(features);
  }).toThrow(InvalidCompositeIdError);
});

test('CompositeId [empty feature set]', () => {
  const compositeId = CompositeId.encode([]);
  expect(CompositeId.decode(compositeId)).toEqual([]);
});

test('CompositeId [empty feature set]', () => {
  const compositeId = CompositeId.encode([]);
  expect(CompositeId.decode(compositeId)).toEqual([]);
});

test('CompositeId [encode / decode]', () => {
  let features = [
    { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION },
  ];
  let compositeId = CompositeId.encode(features);
  expect(CompositeId.decode(compositeId)).toEqual(features);

  features = [
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  compositeId = CompositeId.encode(features);
  expect(CompositeId.decode(compositeId)).toEqual(features);

  features = [
    { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  compositeId = CompositeId.encode(features);
  expect(CompositeId.decode(compositeId)).toEqual(features);
});

test('CompositeId [fuzz test encode / decode]', () => {
  for (let i = 0; i < 100; i++) {
    const n = Random.range(1, 20);
    const features = [];
    for (let j = 0; j < n; j++) {
      const feature = generateCompositeIdFeature();
      features.push(feature);
    }
    const compositeId = CompositeId.encode(features);
    expect(CompositeId.decode(compositeId)).toEqual(features);
  }
});
