import ArrayUtils from '@/lib/ArrayUtils';
import { CardinalDirection } from '@/lib/Constants';
import Random from '@/lib/Random';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import {
  generateTmcDataPoint,
  generateTmc,
  TMC_MODES_VEHICLE,
} from '@/lib/test/random/CountDataGenerator';

test('ReportCountSummaryTurningMovement.computeMovementAndVehicleTotals', () => {
  // fuzz test
  for (let i = 0; i < 25; i++) {
    const rawData = generateTmcDataPoint();
    const data = ReportCountSummaryTurningMovement.computeMovementAndVehicleTotals(rawData);

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

test('ReportCountSummaryTurningMovement.sumIndices', () => {
  // fuzz test
  for (let i = 0; i < 10; i++) {
    const k = 5;
    const countData = generateTmc();
    const indices = Random.sample(ArrayUtils.range(countData.length), k);
    const sum = ReportCountSummaryTurningMovement.sumIndices(countData, indices);
    const keysToTest = Random.sample(Array.from(Object.keys(countData[0].data)), k);
    keysToTest.forEach((key) => {
      expect(sum[key]).toBe(
        ArrayStats.sum(
          ArrayUtils.selectIndices(countData, indices)
            .map(({ data }) => data[key]),
        ),
      );
    });
  }
});
