import TimeFormatters from '@/lib/time/TimeFormatters';

class EmailStudyRequestUtils {
  static renderDays(studyRequest) {
    const { daysOfWeek } = studyRequest;
    return TimeFormatters.formatDaysOfWeek(daysOfWeek);
  }

  static renderHours(studyRequest) {
    const {
      studyType: { isMultiDay },
    } = studyRequest;
    if (isMultiDay) {
      const { duration } = studyRequest;
      return `${duration} hours`;
    }
    let { hours } = studyRequest;
    hours = hours.description.toLowerCase();
    return `${hours} hours`;
  }

  static renderHoursString(studyHours) {
    if (studyHours === null) return 'None';

    const hoursString = `${studyHours.description}`;
    const ranges = studyHours.times.map(timeRange => ` ${timeRange[0]} - ${timeRange[1]}`);
    return `${hoursString}:${ranges}`;
  }

  static renderCoordinates(coords) {
    return `(${coords[0]}, ${coords[1]})`;
  }
}

export default EmailStudyRequestUtils;
