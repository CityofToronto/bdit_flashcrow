import { CentrelineType } from '@/lib/Constants';
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
