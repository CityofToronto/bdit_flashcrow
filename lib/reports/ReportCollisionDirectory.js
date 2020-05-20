/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType } from '@/lib/Constants';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';
import TimeFormatters from '@/lib/time/TimeFormatters';

class ReportCollisionDirectory extends ReportBaseCrash {
  type() {
    return ReportType.COLLISION_DIRECTORY;
  }

  static getCollisionDirectoryEntry(collision) {
    const {
      accnb,
      accdate,
      acclass,
      traffictl,
      rdsfcond,
      visible,
      impactype = null,
      roadClass,
      changed,
      mvaimg,
      involved,
    } = collision;
    const verified = changed !== null;
    const hasMvaImage = mvaimg !== null;

    let drivers = involved.filter(
      ({ invtype }) => invtype === 1 || invtype === 6 || invtype === 18,
    );
    drivers = ArrayUtils.sortBy(drivers, ({ vehNo }) => {
      if (vehNo === null) {
        return Infinity;
      }
      return vehNo;
    });

    const pedestrians = involved.filter(
      ({ invtype }) => invtype === 3 || invtype === 17 || invtype === 19,
    );
    const cyclists = involved.filter(
      ({ invtype, vehtype }) => invtype === 4
        || invtype === 5
        || invtype === 8
        || invtype === 9
        || vehtype === 3
        || vehtype === 36,
    );

    const injured = [0, 0, 0, 0, 0, 0];
    involved.forEach(({ injury }) => {
      if (injury === null) {
        injured[5] += 1;
      } else {
        injured[injury] += 1;
      }
    });

    const alcohol = involved.some(({ drivcond }) => drivcond === 3 || drivcond === 4);
    const redLight = traffictl === 1 && involved.some(({ drivact }) => drivact === 7);

    return {
      accnb,
      accdate,
      acclass,
      traffictl,
      rdsfcond,
      visible,
      impactype,
      drivers,
      pedestrians,
      cyclists,
      injured,
      alcohol,
      redLight,
      roadClass,
      verified,
      hasMvaImage,
    };
  }

  transformData(location, rawData) {
    const collisions = rawData.collisions.map(
      ReportCollisionDirectory.getCollisionDirectoryEntry,
    );
    const collisionSummary = { ...rawData.collisionSummary };
    return { collisions, collisionSummary };
  }

  generateCsv(/* location, { collisions } */) {
    // TODO: implement this
  }

  static getTableDriverCells({
    drivact = null,
    drivcond = null,
    initdir = null,
    invage = null,
    manoeuver = null,
  }) {
    return [
      { value: initdir },
      { value: manoeuver },
      { value: null },
      { value: drivact },
      { value: drivcond },
      { value: invage },
    ];
  }

  static getTableCollisionRow({
    accnb,
    accdate,
    acclass,
    traffictl,
    rdsfcond,
    visible,
    impactype,
    drivers,
    pedestrians,
    cyclists,
    injured,
    alcohol,
    redLight,
    roadClass,
    verified,
    hasMvaImage,
  }, i) {
    const [driver1 = {}, driver2 = {}] = drivers;
    let pedestrianAge = null;
    if (pedestrians.length > 0) {
      pedestrianAge = pedestrians[0].invage;
    }
    let cyclistAge = null;
    if (cyclists.length > 0) {
      cyclistAge = cyclists[0].invage;
    }
    const shade = i % 2 === 1;
    const row = [
      { value: accnb, style: { br: true } },
      { value: TimeFormatters.formatDefault(accdate) },
      { value: TimeFormatters.formatTimeOfDay(accdate) },
      { value: acclass },
      { value: traffictl },
      { value: rdsfcond },
      { value: visible },
      { value: impactype },
      ...ReportCollisionDirectory.getTableDriverCells(driver1),
      ...ReportCollisionDirectory.getTableDriverCells(driver2),
      { value: pedestrianAge },
      { value: cyclistAge },
      ...injured.map(value => ({ value })),
      { value: drivers.length },
      { value: pedestrians.length },
      { value: cyclists.length },
      { value: alcohol },
      { value: redLight },
      { value: roadClass },
      { value: verified },
      { value: hasMvaImage },
    ];
    return row.map(({ style = {}, ...cellRest }) => {
      const styleShaded = { ...style, shade };
      return {
        ...cellRest,
        style: styleShaded,
      };
    });
  }

  getTableOptions(collisions) {
    return {
      columnStyles: [
        // TODO: these
      ],
      header: [
        [
          { value: 'MVA' },
          { value: null },
          { value: null },
          { value: 'Acc' },
          { value: 'Traffic' },
          { value: 'Rd Surf' },
          { value: null },
          { value: null },
          { value: 'Driver 1', colspan: 6 },
          { value: 'Driver 2', colspan: 6 },
          { value: 'Ped' },
          { value: 'Bike' },
          { value: 'Injury', colspan: 6 },
          { value: '#' },
          { value: '#' },
          { value: '#' },
          { value: 'Alcohol' },
          { value: 'Red' },
          { value: null },
          { value: 'Verif' },
          { value: 'MVA' },
        ], [
          { value: 'Number' },
          { value: 'Date' },
          { value: 'Time' },
          { value: 'Cla' },
          { value: 'Control' },
          { value: 'Cond' },
          { value: 'Visib' },
          { value: 'Impact' },
          // driver 1
          { value: 'Dir' },
          { value: 'Manoeuver' },
          { value: 'Charge' },
          { value: 'Action' },
          { value: 'Cond' },
          { value: 'Age' },
          // driver 2
          { value: 'Dir' },
          { value: 'Manoeuver' },
          { value: 'Charge' },
          { value: 'Action' },
          { value: 'Cond' },
          { value: 'Age' },
          // ---
          { value: 'Age' },
          { value: 'Age' },
          // injury
          { value: 'NO' },
          { value: 'MI' },
          { value: 'MR' },
          { value: 'MJ' },
          { value: 'FA' },
          { value: 'OT' },
          // counts (#)
          { value: 'Driver' },
          { value: 'Ped' },
          { value: 'Cyclist' },
          // ---
          { value: 'Involv' },
          { value: 'Light' },
          { value: 'Road Class' },
          { value: 'ied' },
          { value: 'Img' },
        ],
      ],
      body: collisions.map(ReportCollisionDirectory.getTableCollisionRow),
    };
  }

  generateLayoutContent(location, { collisions, collisionSummary }) {
    const collisionSummaryBlock = ReportBaseCrash.getCollisionsSummaryBlock(collisionSummary);
    const tableOptions = this.getTableOptions(collisions);
    return [
      collisionSummaryBlock,
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

export default ReportCollisionDirectory;
