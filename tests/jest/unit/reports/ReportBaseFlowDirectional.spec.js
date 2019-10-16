import { CardinalDirection } from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import {
  generateTmcDataPoint,
  TMC_MODES_VEHICLE,
} from '@/lib/test/random/CountDataGenerator';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';

test('ReportCountSummaryTurningMovement.computeMovementAndVehicleTotals', () => {
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
