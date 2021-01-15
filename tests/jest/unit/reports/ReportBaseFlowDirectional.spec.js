import { CardinalDirection } from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import {
  generateTmcDataPoint,
  TMC_MODES_VEHICLE,
} from '@/lib/test/random/CountDataGenerator';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';

test('ReportBaseFlowDirectional.computeMovementAndVehicleTotals', () => {
  // fuzz test
  for (let i = 0; i < 25; i++) {
    const rawData = generateTmcDataPoint();
    const data = ReportBaseFlowDirectional.computeMovementAndVehicleTotals(rawData);

    // every vehicle that enters must exit
    TMC_MODES_VEHICLE.forEach((mode) => {
      const sumModeEnters = ArrayStats.sum(CardinalDirection.enumValues.map(
        dir => data[`${dir}_${mode}_TOTAL`],
      ));
      const sumModeExits = ArrayStats.sum(CardinalDirection.enumValues.map(
        dir => data[`${dir}_${mode}_EXITS`],
      ));
      expect(sumModeExits).toBe(sumModeEnters);
    });
    const sumVehicleEnters = ArrayStats.sum(CardinalDirection.enumValues.map(
      ({ short: dir }) => data[`${dir}_VEHICLE_TOTAL`],
    ));
    const sumVehicleExits = ArrayStats.sum(CardinalDirection.enumValues.map(
      dir => data[`${dir}_VEHICLE_EXITS`],
    ));
    expect(sumVehicleExits).toBe(sumVehicleEnters);
  }
});

test('ReportBaseFlowDirectional.getRoads', () => {
  let segments = [];
  expect(ReportBaseFlowDirectional.getRoads(segments)).toEqual([]);

  segments = [{ roadId: 42 }];
  expect(ReportBaseFlowDirectional.getRoads(segments)).toEqual([[0]]);

  segments = [{ roadId: 42 }, { roadId: 42 }];
  expect(ReportBaseFlowDirectional.getRoads(segments)).toEqual([[0, 1]]);

  segments = [{ roadId: 42 }, { roadId: 1729 }];
  expect(ReportBaseFlowDirectional.getRoads(segments)).toEqual([[0], [1]]);

  segments = [{ roadId: 42 }, { roadId: 1729 }, { roadId: 42 }, { roadId: 73 }];
  expect(ReportBaseFlowDirectional.getRoads(segments)).toEqual([[0, 2], [3], [1]]);
});

test('ReportBaseFlowDirectional.inferRoadDirections', () => {
  let roads = [];
  let directionCandidates = new Map();
  expect(ReportBaseFlowDirectional.inferRoadDirections(roads, directionCandidates)).toEqual([
    [CardinalDirection.SOUTH, CardinalDirection.NORTH],
    [CardinalDirection.WEST, CardinalDirection.EAST],
  ]);

  roads = [[0]];
  directionCandidates = new Map([[CardinalDirection.WEST, 0]]);
  expect(ReportBaseFlowDirectional.inferRoadDirections(roads, directionCandidates)).toEqual([
    [CardinalDirection.EAST, CardinalDirection.WEST],
    [CardinalDirection.SOUTH, CardinalDirection.NORTH],
  ]);

  roads = [[0, 3], [2, 1]];
  directionCandidates = new Map([
    [CardinalDirection.WEST, 0],
    [CardinalDirection.NORTH, 1],
    [CardinalDirection.SOUTH, 2],
    [CardinalDirection.EAST, 3],
  ]);
  expect(ReportBaseFlowDirectional.inferRoadDirections(roads, directionCandidates)).toEqual([
    [CardinalDirection.EAST, CardinalDirection.WEST],
    [CardinalDirection.NORTH, CardinalDirection.SOUTH],
  ]);

  roads = [[0, 2], [1]];
  directionCandidates = new Map([
    [CardinalDirection.SOUTH, 0],
    [CardinalDirection.EAST, 1],
    [CardinalDirection.NORTH, 2],
  ]);
  expect(ReportBaseFlowDirectional.inferRoadDirections(roads, directionCandidates)).toEqual([
    [CardinalDirection.NORTH, CardinalDirection.SOUTH],
    [CardinalDirection.WEST, CardinalDirection.EAST],
  ]);

  roads = [[0, 3], [2, 1]];
  directionCandidates = new Map([
    [CardinalDirection.NORTH, 1],
    [CardinalDirection.SOUTH, 2],
    [CardinalDirection.EAST, 3],
  ]);
  expect(ReportBaseFlowDirectional.inferRoadDirections(roads, directionCandidates)).toEqual([
    [CardinalDirection.WEST, CardinalDirection.EAST],
    [CardinalDirection.NORTH, CardinalDirection.SOUTH],
  ]);
});
