import { Enum } from '@/lib/ClassUtils';
import {
  LocationSelectionType,
  ReportExportMode,
  ReportFormat,
  ReportType,
} from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

class JobType extends Enum {
  get jobName() {
    return `${JobType.NAME_PREFIX}${this.name}`;
  }
}
JobType.init({
  COMPRESS_MVCRS: {
    id: 'COMPRESS_MVCRS',
    dataSchema: Joi.object(),
    getMetadata({ mvcrs }) {
      return { mcvrsCount: mvcrs.length };
    },
    metadataSchema: Joi.object(),
    getProgressTotal() {
      return 1;
    },
  },
  GENERATE_REPORTS: {
    dataSchema: Joi.object().keys({
      ...CentrelineSelection,
      reportExportMode: Joi.enum().ofType(ReportExportMode),
      reports: Joi.array().items(
        Joi.object({
          type: Joi.enum().ofType(ReportType).required(),
          id: Joi.string().required(),
          format: Joi.enum().ofType(ReportFormat).required(),
        }).unknown(),
      ),
      selectionType: Joi.enum().ofType(LocationSelectionType).required(),
    }),
    getMetadata({ reportExportMode, s1, selectionType }) {
      return { reportExportMode, s1, selectionType };
    },
    getProgressTotal({ reports }) {
      return reports.length;
    },
    metadataSchema: Joi.object().keys({
      ...CentrelineSelection,
      reportExportMode: Joi.enum().ofType(ReportExportMode),
      selectionType: Joi.enum().ofType(LocationSelectionType).required(),
    }),
  },
});
JobType.NAME_PREFIX = 'MOVE:';

export default JobType;
