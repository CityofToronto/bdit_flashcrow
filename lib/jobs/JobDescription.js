import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { InvalidJobTypeError } from '@/lib/error/JobErrors';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import CompositeId from '@/lib/io/CompositeId';
import JobType from '@/lib/jobs/JobType';

class JobDescription {
  static async getGenerateReports({ reportExportMode, s1, selectionType }) {
    const features = CompositeId.decode(s1);
    const locations = await CentrelineDAO.byFeatures(features);
    const locationsSelection = { locations, selectionType };
    const description = getLocationsSelectionDescription(locationsSelection);
    return `${reportExportMode.description}: ${description}`;
  }

  static async get(type, data) {
    if (type === JobType.GENERATE_REPORTS) {
      return JobDescription.getGenerateReports(data);
    }
    throw new InvalidJobTypeError(type);
  }
}

export default JobDescription;
