import { Enum } from '@/lib/ClassUtils';
import { ReportExportMode, ReportFormat, ReportType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

class JobType extends Enum {
  get jobName() {
    return `${JobType.NAME_PREFIX}${this.name}`;
  }
}
JobType.init({
  GENERATE_REPORTS: {
    getMetadata({ reportExportMode, s1 }) {
      return { reportExportMode, s1 };
    },
    getProgressTotal({ reports }) {
      return reports.length;
    },
    async validateData(data) {
      const dataSchema = Joi.object().keys({
        ...CentrelineSelection,
        reportExportMode: Joi.enum().ofType(ReportExportMode),
        reports: Joi.array().items(
          Joi.object({
            type: Joi.enum().ofType(ReportType).required(),
            id: Joi.string().required(),
            format: Joi.enum().ofType(ReportFormat).required(),
          }).unknown(),
        ),
      });

      const { s1 } = data;
      const dataNormalized = await dataSchema.validateAsync(data);
      dataNormalized.s1 = s1;
      return dataNormalized;
    },
  },
});
JobType.NAME_PREFIX = 'MOVE:';

export default JobType;
