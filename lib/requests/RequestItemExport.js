import { csvFormat } from 'd3-dsv';

import { formatDuration } from '@/lib/StringFormatters';
import TimeFormatters from '@/lib/time/TimeFormatters';

const CSV_COLUMNS = [
  'id',
  'location',
  'studyType',
  'requestedBy',
  'createdAt',
  'assignedTo',
  'dueDate',
  'status',
  'lastEditedAt',
  'urgent',
  'urgentReason',
  'estimatedDeliveryDate',
  'lng',
  'lat',
  'daysOfWeek',
  'duration',
  'hours',
  'notes',
];

class RequestItemExport {
  static getItemRow(item) {
    let { location, requestedBy } = item;
    if (location !== null) {
      location = location.description;
    }
    if (requestedBy !== null) {
      requestedBy = requestedBy.uniqueName;
    }

    const { studyRequest } = item;
    const {
      assignedTo,
      geom: {
        coordinates: [lng, lat],
      },
      hours,
      id,
      notes,
      status,
      studyType,
      urgent,
      urgentReason,
    } = studyRequest;

    let {
      createdAt,
      daysOfWeek,
      dueDate,
      duration,
      estimatedDeliveryDate,
      lastEditedAt,
    } = studyRequest;
    createdAt = TimeFormatters.formatDefault(createdAt);
    daysOfWeek = TimeFormatters.formatDaysOfWeek(daysOfWeek);
    dueDate = TimeFormatters.formatDefault(studyRequest.dueDate);
    if (studyType.automatic) {
      duration = formatDuration(duration);
    } else {
      duration = null;
    }
    estimatedDeliveryDate = TimeFormatters.formatDefault(studyRequest.estimatedDeliveryDate);
    if (lastEditedAt !== null) {
      lastEditedAt = TimeFormatters.formatDefault(lastEditedAt);
    }

    return {
      assignedTo,
      createdAt,
      daysOfWeek,
      dueDate,
      duration,
      estimatedDeliveryDate,
      hours,
      id,
      lastEditedAt,
      lat,
      lng,
      location,
      notes,
      requestedBy,
      status,
      studyType,
      urgent,
      urgentReason,
    };
  }

  static get(items) {
    const csvRows = items.map(RequestItemExport.getItemRow);
    return csvFormat(csvRows, CSV_COLUMNS);
  }
}

export default RequestItemExport;
