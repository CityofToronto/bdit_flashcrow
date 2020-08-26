import { Enum } from '@/lib/ClassUtils';
import { ReportFormat, ReportType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

class JobType extends Enum {
  get jobName() {
    return `${JobType.NAME_PREFIX}${this.name}`;
  }

  async validateData(data) {
    return this.dataSchema.validateAsync(data);
  }
}
JobType.init({
  GENERATE_REPORTS: {
    dataSchema: Joi.object().keys({
      ...CentrelineSelection,
      reports: Joi.array().items(
        Joi.object({
          type: Joi.enum().ofType(ReportType).required(),
          id: Joi.string().required(),
          format: Joi.enum().ofType(ReportFormat).required(),
        }).unknown(),
      ),
    }),
    getProgressTotal({ reports }) {
      return reports.length;
    },
  },
});
JobType.NAME_PREFIX = 'MOVE:';

export default JobType;
