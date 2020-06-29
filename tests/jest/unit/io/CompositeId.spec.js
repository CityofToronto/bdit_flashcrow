import { CentrelineType } from '@/lib/Constants';
import Random from '@/lib/Random';
import { InvalidCompositeIdError } from '@/lib/error/MoveErrors';
import CompositeId from '@/lib/io/CompositeId';

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
    CompositeId.decode('s1:blargl');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('s1:blargl:');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('invalidType:blargl');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('s1:1e:AAAA');
  }).toThrow(InvalidCompositeIdError);

  expect(() => {
    CompositeId.decode('s1:1e:AAAAA');
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
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  let compositeId = CompositeId.encode(features);
  expect(CompositeId.decode(compositeId)).toEqual(features);

  features = [
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  compositeId = CompositeId.encode(features);
  expect(CompositeId.decode(compositeId)).toEqual(features);

  features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
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
      const centrelineId = Random.range(1, 0x20000000);
      const centrelineType = Random.choice([
        CentrelineType.SEGMENT,
        CentrelineType.INTERSECTION,
      ]);
      features.push({ centrelineId, centrelineType });
    }
    const compositeId = CompositeId.encode(features);
    expect(CompositeId.decode(compositeId)).toEqual(features);
  }
});
