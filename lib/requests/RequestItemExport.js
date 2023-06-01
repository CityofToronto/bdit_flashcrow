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
  'Location',
  'Site #',
  'Longitude',
  'Latitude',
  'Study Type',
  'Duration (Days)',
  'Days of Week',
  'Hours',
  'Collection Notes',
  'MOVE ID',
  'Date Requested',
  'Client',
  'Project Request',
  'Urgent',
  'Urgent Reason',
  'Status',
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
    const dateRequested = TimeFormatters.formatCsvDate(item.studyRequest.createdAt);
    const projectRequest = RequestItemExport.getItemProjectRequest(item, studyRequestsBulkById);

    const {
      id,
      urgent,
      urgentReason,
      notes,
    } = item.studyRequest;

    let { hours, duration } = item.studyRequest;
    if (hours === null) hours = '';
    if (duration === null) duration = 24;
    duration /= 24;

    const status = item.studyRequest.status.text;
    const [lng, lat] = item.studyRequest.geom.coordinates;
    const daysOfWeek = TimeFormatters.formatDaysOfWeek(item.studyRequest.daysOfWeek);

    return [
      reqId,
      location,
      siteNo,
      lng,
      lat,
      studyType,
      duration,
      daysOfWeek,
      hours,
      notes,
      id,
      dateRequested,
      client,
      projectRequest,
      urgent,
      urgentReason,
      status,
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
