import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { InvalidJobTypeError } from '@/lib/error/JobErrors';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import CompositeId from '@/lib/io/CompositeId';
import JobType from '@/lib/jobs/JobType';

class JobDescription {
  static async getGenerateReports({ reportExportMode, s1, selectionType }) {
    const features = CompositeId.decode(s1);
    let locations = await CentrelineDAO.byFeatures(features);
    locations = locations.filter(location => location !== null);
    const locationsSelection = { locations, selectionType };
    const description = getLocationsSelectionDescription(locationsSelection);
    if (description === null) {
      /*
       * Fallback if all locations have been removed from the centreline since the job was
       * created.  This is *extremely* unlikely, but should still be handled.
       */
      return `${reportExportMode.description}: locations not found`;
    }
    return `${reportExportMode.description}: ${description}`;
  }

  static async get(type, data) {
    if (type === JobType.GENERATE_REPORTS) {
      return JobDescription.getGenerateReports(data);
    }
    if (type === JobType.COMPRESS_MVCRS) {
      const { location } = data;
      return `MVCRs: ${location}`;
    }
    throw new InvalidJobTypeError(type);
  }
}

export default JobDescription;
