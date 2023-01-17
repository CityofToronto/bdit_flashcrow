import { mapBy } from '@/lib/MapUtils';
import { formatUsername } from '@/lib/StringFormatters';
import TimeFormatters from '@/lib/time/TimeFormatters';

const CSV_COLUMNS = [
  /*
   * These columns are from the Data Collection master spreadsheet, which is used
   * internally to track requests from legacy systems.  MOVE offers these columns
   * to aid in the transition between systems.
   *
   * Note that Req.ID is not the same as `id`; see `ID_DATA_COLLECTION_ADJUST` below
   * for more details.
   */
  'Req.ID',
  'Client',
  'Location',
  'Site #',
  'Study Type',
  'Study Type (Other)',
  'Hours',
  'Date Requested',
  'Date Required',
  'Project Request',
  'Comments',
  /*
   * These columns are MOVE-specific.  We include `id` here so that users have the
   * original MOVE ID if need be.
   *
   * We also include several columns that are not included in the above list.
   */
  'MOVE ID',
  'Status',
  'Urgent',
  'Urgent Reason',
  'Longitude',
  'Latitude',
  'Days of Week',
];

/*
 * While Data Collection transitions from legacy systems to MOVE, it is important that MOVE
 * requests appear in rough chronological order with requests from legacy systems.  As a quick
 * solution, we add `ID_DATA_COLLECTION_ADJUST` to `id` when exporting, so that these appear
 * at the bottom of the spreadsheet under the default ID-based sort.
 *
 * This value is high enough that ID overlap during the transition phase is *extremely*
 * unlikely.
 */
const ID_DATA_COLLECTION_ADJUST = 200000;

class RequestItemExport {
  static getItemHours(item) {
    const { studyRequest } = item;
    const { duration, hours, studyType } = studyRequest;
    if (studyType.automatic) {
      return duration;
    }
    return hours.descriptionCsv;
  }

  static getItemProjectRequest(item, studyRequestsBulkById) {
    const { studyRequestBulkId } = item.studyRequest;
    if (studyRequestBulkId === null) {
      return null;
    }
    if (!studyRequestsBulkById.has(studyRequestBulkId)) {
      return null;
    }
    const studyRequestBulk = studyRequestsBulkById.get(studyRequestBulkId);
    return studyRequestBulk.name;
  }

  static getItemRow(item, studyRequestsBulkById) {
    const reqId = item.studyRequest.id + ID_DATA_COLLECTION_ADJUST;

    let client = null;
    if (item.requestedBy !== null) {
      client = formatUsername(item.requestedBy);
    }
    let location = null;
    let siteNo = null;
    if (item.location !== null) {
      location = item.location.description
        .replace('\u2013', '-')
        .replace('\u2192', '--');
      siteNo = item.location.centrelineId;
    }
    const studyType = item.studyRequest.studyType.label;
    const hours = RequestItemExport.getItemHours(item);
    const dateRequested = TimeFormatters.formatCsvDate(item.studyRequest.createdAt);
    const dateRequired = TimeFormatters.formatCsvDate(item.studyRequest.dueDate);
    const projectRequest = RequestItemExport.getItemProjectRequest(item, studyRequestsBulkById);
    const comments = item.studyRequest.notes;

    const {
      id,
      studyTypeOther,
      urgent,
      urgentReason,
    } = item.studyRequest;
    const status = item.studyRequest.status.text;
    const [lng, lat] = item.studyRequest.geom.coordinates;
    const daysOfWeek = TimeFormatters.formatDaysOfWeek(item.studyRequest.daysOfWeek);

    return [
      // Data Collection columns
      reqId,
      client,
      location,
      siteNo,
      studyType,
      studyTypeOther,
      hours,
      dateRequested,
      dateRequired,
      projectRequest,
      comments,
      // MOVE columns
      id,
      status,
      urgent,
      urgentReason,
      lng,
      lat,
      daysOfWeek,
    ];
  }

  static get(items, studyRequestsBulk) {
    const studyRequestsBulkById = mapBy(studyRequestsBulk, ({ id }) => id);
    const rows = items.map(
      item => RequestItemExport.getItemRow(item, studyRequestsBulkById),
    );
    return { columns: CSV_COLUMNS, rows };
  }
}

export default RequestItemExport;
