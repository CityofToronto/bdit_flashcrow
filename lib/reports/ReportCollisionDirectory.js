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
    const verified = changed === -1;
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

    const pedestrians = involved.filter(({ pedestrian }) => pedestrian);
    const cyclists = involved.filter(({ cyclist }) => cyclist);

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

  getCsvDriverCells({
    drivact = null,
    drivcond = null,
    initdir = null,
    invage = null,
    manoeuver = null,
  }) {
    return {
      drivact: this.getCollisionFactorCode('drivact', drivact),
      drivcond: this.getCollisionFactorCode('drivcond', drivcond),
      initdir: this.getCollisionFactorCode('initdir', initdir),
      invage: this.getCollisionFactorCode('invage', invage),
      manoeuver: this.getCollisionFactorCode('manoeuver', manoeuver),
    };
  }

  getCsvCollisionRow({
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
  }) {
    const [driver1 = {}, driver2 = {}] = drivers;
    const driver1Cells = this.getCsvDriverCells(driver1);
    const driver2Cells = this.getCsvDriverCells(driver2);
    return {
      accnb,
      accdate: TimeFormatters.formatCsv(accdate),
      acclass: this.getCollisionFactorCode('acclass', acclass),
      traffictl: this.getCollisionFactorCode('traffictl', traffictl),
      rdsfcond: this.getCollisionFactorCode('rdsfcond', rdsfcond),
      visible: this.getCollisionFactorCode('visible', visible),
      impactype: this.getCollisionFactorCode('impactype', impactype),
      initdir1: driver1Cells.initdir,
      manoeuver1: driver1Cells.manoeuver,
      drivact1: driver1Cells.drivact,
      drivcond1: driver1Cells.drivcond,
      invage1: driver1Cells.invage,
      initdir2: driver2Cells.initdir,
      manoeuver2: driver2Cells.manoeuver,
      drivact2: driver2Cells.drivact,
      drivcond2: driver2Cells.drivcond,
      invage2: driver2Cells.invage,
      drivers: drivers.length,
      pedestrians: pedestrians.length,
      cyclists: cyclists.length,
      injured0: injured[0],
      injured1: injured[1],
      injured2: injured[2],
      injured3: injured[3],
      injured4: injured[4],
      injured5: injured[5],
      verified,
      hasMvaImage,
    };
  }

  generateCsv(location, { collisions }) {
    const columns = [
      { key: 'accnb', header: 'MVA Number' },
      { key: 'accdate', header: 'Date Time' },
      { key: 'acclass', header: 'Acc Cla' },
      { key: 'traffictl', header: 'Traffic Control' },
      { key: 'rdsfcond', header: 'Rd Surf' },
      { key: 'visible', header: 'Visib' },
      { key: 'impactype', header: 'Impact' },
      { key: 'initdir1', header: 'Dir 1' },
      { key: 'manoeuver1', header: 'Manoeuver 1' },
      { key: 'drivact1', header: 'Action 1' },
      { key: 'drivcond1', header: 'Cond 1' },
      { key: 'invage1', header: 'Age 1' },
      { key: 'initdir2', header: 'Dir 2' },
      { key: 'manoeuver2', header: 'Manoeuver 2' },
      { key: 'drivact2', header: 'Action 2' },
      { key: 'drivcond2', header: 'Cond 2' },
      { key: 'invage2', header: 'Age 2' },
      { key: 'drivers', header: '# Driver' },
      { key: 'pedestrians', header: '# Ped' },
      { key: 'cyclists', header: '# Cyclist' },
      { key: 'injured0', header: 'Injury NO' },
      { key: 'injured1', header: 'Injury MI' },
      { key: 'injured2', header: 'Injury MR' },
      { key: 'injured3', header: 'Injury MJ' },
      { key: 'injured4', header: 'Injury FA' },
      { key: 'injured5', header: 'Injury OT' },
      { key: 'verified', header: 'Verified' },
      { key: 'hasMvaImage', header: 'MVA Img' },
    ];
    const rows = collisions.map(this.getCsvCollisionRow.bind(this));
    return { columns, rows };
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

  generateLayoutContent(parsedId, { collisions, collisionSummary }) {
    const collisionSummaryBlock = ReportBaseCrash.getCollisionsSummaryBlock(collisionSummary);
    const tableOptions = this.getTableOptions(collisions);
    return [
      collisionSummaryBlock,
      { type: ReportBlock.TABLE, options: tableOptions },
    ];
  }
}

export default ReportCollisionDirectory;
