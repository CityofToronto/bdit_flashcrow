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
}

export default EmailStudyRequestUtils;
