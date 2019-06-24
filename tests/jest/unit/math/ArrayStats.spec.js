import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';

test('ArrayStats.sum()', () => {
  expect(ArrayStats.sum([])).toEqual(0);
  expect(ArrayStats.sum([42])).toEqual(42);
  expect(ArrayStats.sum(ArrayUtils.range(5))).toEqual(10);
  expect(ArrayStats.sum(ArrayUtils.range(-10, 10))).toEqual(-10);
  expect(ArrayStats.sum(
    [0, 0, 0, 4, 1, 10, 9, 11, 7, 4, 0, 0, 1, 0],
  )).toEqual(47);
});

test('ArrayStats.histogramPercentile()', () => {
  expect(() => {
    ArrayStats.histogramPercentile([], [], 0.85);
  }).toThrow();
  expect(() => {
    ArrayStats.histogramPercentile([], [1, 2], 0.85);
  }).toThrow();
  expect(() => {
    ArrayStats.histogramPercentile(
      [[0, 10], [10, 20], [20, 30]],
      [1, 2],
      0.85,
    );
  }).toThrow();
  expect(() => {
    ArrayStats.histogramPercentile(
      [[0, 10], [10, 20], [20, 30]],
      [0, 0, 0],
      0.85,
    );
  }).toThrow();

  let p;

  p = ArrayStats.histogramPercentile(
    [[0, 10], [10, 20], [20, 30]],
    [6, 12, 6],
    0,
  );
  expect(p).toEqual(0);

  p = ArrayStats.histogramPercentile(
    [[0, 10], [10, 20], [20, 30]],
    [6, 12, 6],
    0.25,
  );
  expect(p).toEqual(10);

  p = ArrayStats.histogramPercentile(
    [[0, 10], [10, 20], [20, 30]],
    [6, 12, 6],
    0.5,
  );
  expect(p).toEqual(15);

  p = ArrayStats.histogramPercentile(
    [[0, 10], [10, 20], [20, 30]],
    [6, 12, 6],
    0.75,
  );
  expect(p).toEqual(20);

  p = ArrayStats.histogramPercentile(
    [[0, 10], [10, 20], [20, 30]],
    [6, 12, 6],
    1,
  );
  expect(p).toEqual(30);
});

test('ArrayStats.histogramPercentile() [Trax Pro]', () => {
  let p;

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 0, 4, 1, 10, 9, 11, 7, 4, 0, 0, 1, 0],
    0.85,
  );
  expect(Math.floor(p)).toEqual(58);

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 0, 4, 1, 10, 9, 11, 7, 4, 0, 0, 1, 0],
    0.95,
  );
  expect(Math.floor(p)).toEqual(63);

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 19, 100, 71, 84, 115, 88, 32, 7, 4, 0, 0, 0],
    0.85,
  );
  expect(Math.floor(p)).toEqual(53);

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 19, 100, 71, 84, 115, 88, 32, 7, 4, 0, 0, 0],
    0.95,
  );
  // 58 in the report
  expect(Math.floor(p)).toEqual(57);

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 0, 0, 0, 4, 6, 3, 7, 2, 2, 1, 1, 0],
    0.85,
  );
  expect(Math.floor(p)).toEqual(65);

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 0, 0, 0, 4, 6, 3, 7, 2, 2, 1, 1, 0],
    0.95,
  );
  expect(Math.floor(p)).toEqual(75);

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 0, 2, 2, 2, 10, 10, 17, 9, 3, 0, 0, 2],
    0.85,
  );
  // 63 in the report
  expect(Math.floor(p)).toEqual(62);

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 0, 2, 2, 2, 10, 10, 17, 9, 3, 0, 0, 2],
    0.95,
  );
  // 67 in the report
  expect(Math.floor(p)).toEqual(68);
});

test('ArrayStats.histogramPercentile() [Trax Pro right-skewed]', () => {
  let p;

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 12, 728],
    0.85,
  );
  // 148 in the report
  expect(Math.floor(p)).toEqual(147);

  p = ArrayStats.histogramPercentile(
    Constants.SPEED_CLASSES,
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 12, 728],
    0.95,
  );
  // 156 in the report
  expect(Math.floor(p)).toEqual(155);
});

test('ArrayStats.histogramMean() [Trax Pro]', () => {
  let p;

  p = ArrayStats.histogramMean(
    Constants.SPEED_CLASSES,
    [33, 62, 152, 411, 1155, 2621, 4799, 5579, 3354, 1359, 459, 138, 38, 22],
  );
  // 51 in the report
  expect(Math.floor(p)).toEqual(50);

  p = ArrayStats.histogramMean(
    Constants.SPEED_CLASSES,
    [275, 421, 825, 2678, 3139, 4736, 7799, 8568, 5812, 2787, 862, 234, 79, 34],
  );
  // 49 in the report
  expect(Math.floor(p)).toEqual(48);

  p = ArrayStats.histogramMean(
    Constants.SPEED_CLASSES,
    [2, 0, 0, 1, 0, 2, 4, 1, 13, 33, 70, 266, 1240, 44491],
  );
  // 119 in the report
  expect(Math.floor(p)).toEqual(118);
});
