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

  getTableDriverCells({
    drivact = null,
    drivcond = null,
    initdir = null,
    invage = null,
    manoeuver = null,
  }) {
    return [
      { value: this.getCollisionFactorCode('initdir', initdir), style: { bl: true } },
      { value: this.getCollisionFactorCode('manoeuver', manoeuver) },
      { value: this.getCollisionFactorCode('drivact', drivact) },
      { value: this.getCollisionFactorCode('drivcond', drivcond) },
      { value: invage },
    ];
  }

  getTableCollisionRow({
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
    verified,
    hasMvaImage,
  }, i) {
    const [driver1 = {}, driver2 = {}] = drivers;
    const shade = i % 2 === 1;
    const row = [
      { value: accnb, style: { br: true } },
      { value: TimeFormatters.formatDefault(accdate) },
      { value: TimeFormatters.formatTimeOfDay(accdate) },
      { value: this.getCollisionFactorCode('acclass', acclass) },
      { value: this.getCollisionFactorCode('traffictl', traffictl) },
      { value: this.getCollisionFactorCode('rdsfcond', rdsfcond) },
      { value: this.getCollisionFactorCode('visible', visible) },
      { value: this.getCollisionFactorCode('impactype', impactype) },
      ...this.getTableDriverCells(driver1),
      ...this.getTableDriverCells(driver2),
      { value: drivers.length, style: { bl: true } },
      { value: pedestrians.length },
      { value: cyclists.length, style: { br: true } },
      ...injured.map((value, j) => ({ value, style: { br: j === 5 } })),
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
      tableStyle: { fontSize: 'xs' },
      header: [
        [
          { value: 'MVA', style: { br: true } },
          { value: null },
          { value: null },
          { value: 'Acc' },
          { value: 'Traffic' },
          { value: 'Rd' },
          { value: null },
          { value: null },
          { value: 'Driver 1', colspan: 5, style: { bl: true } },
          { value: 'Driver 2', colspan: 5, style: { bl: true } },
          { value: '#', style: { bl: true } },
          { value: '#' },
          { value: '#', style: { br: true } },
          { value: 'Injury', colspan: 6, style: { br: true } },
          { value: 'Verif' },
          { value: 'MVA' },
        ], [
          { value: 'Number', style: { br: true } },
          { value: 'Date' },
          { value: 'Time' },
          { value: 'Cla' },
          { value: 'Control' },
          { value: 'Surf' },
          { value: 'Visib' },
          { value: 'Impact' },
          // driver 1
          { value: 'Dir', style: { bl: true } },
          { value: 'Manoeuver' },
          { value: 'Action' },
          { value: 'Cond' },
          { value: 'Age' },
          // driver 2
          { value: 'Dir', style: { bl: true } },
          { value: 'Manoeuver' },
          { value: 'Action' },
          { value: 'Cond' },
          { value: 'Age' },
          // counts (#)
          { value: 'Driver', style: { bl: true } },
          { value: 'Ped' },
          { value: 'Cyclist', style: { br: true } },
          // injury
          { value: 'NO' },
          { value: 'MI' },
          { value: 'MR' },
          { value: 'MJ' },
          { value: 'FA' },
          { value: 'OT', style: { br: true } },
          // ---
          { value: 'ied' },
          { value: 'Img' },
        ],
      ],
      body: collisions.map(this.getTableCollisionRow.bind(this)),
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
