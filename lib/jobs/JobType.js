import { Enum } from '@/lib/ClassUtils';
import { ReportFormat, ReportType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

class JobType extends Enum {
  async validateData(data) {
    return this.dataSchema.validateAsync(data);
  }
}
JobType.init({
  GENERATE_REPORTS: {
    dataSchema: Joi.object().keys({
      reports: Joi.array().items(
        Joi.object({
          type: Joi.enum().ofType(ReportType).required(),
          id: Joi.string().required(),
          format: Joi.enum().ofType(ReportFormat).required(),
        }),
      ),
    }),
    getProgressTotal({ reports }) {
      return reports.length;
    },
  },
});

export default JobType;
