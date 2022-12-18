import { StudyRequestStatus, AuthScope } from '@/lib/Constants';

class SrStatusTransitionValidator {
  constructor(authScopes) {
    this.authScopes = authScopes;
  }

  validTransitions(currentStatus) {
    return this.getRulesForScope(currentStatus);
  }

  isValidTransition(oldStatus, newStatus) {
    const validStatuses = this.getRulesForScope(oldStatus);
    return validStatuses.includes(newStatus);
  }

  getRulesForScope(currentStatus) {
    let rules = [];
    if (this.authScopes.includes(AuthScope.STUDY_REQUESTS_ADMIN)) {
      rules = SrStatusTransitionValidator.adminRules(currentStatus);
    } else if (this.authScopes.includes(AuthScope.STUDY_REQUESTS)) {
      rules = SrStatusTransitionValidator.requestorRules(currentStatus);
    }
    return rules;
  }

  static adminRules(currentStatus) {
    let validTransitions = [];
    const srs = StudyRequestStatus;
    switch (currentStatus) {
      case srs.REQUESTED:
        validTransitions = [srs.ASSIGNED, srs.CANCELLED, srs.CHANGES_NEEDED];
        break;
      case srs.ASSIGNED:
        validTransitions = [srs.COMPLETED, srs.CANCELLED, srs.CHANGES_NEEDED, srs.REJECTED];
        break;
      case srs.CANCELLED:
      case srs.COMPLETED:
        validTransitions = [];
        break;
      case srs.REJECTED:
        validTransitions = [srs.ASSIGNED, srs.COMPLETED];
        break;
      case srs.CHANGES_NEEDED:
        validTransitions = [srs.REQUESTED, srs.ASSIGNED, srs.CANCELLED];
        break;
      default:
        throw new Error('Curent Study Request Status is invalid');
    }
    return validTransitions;
  }

  static requestorRules(currentStatus) {
    const s = StudyRequestStatus;
    return currentStatus === s.REQUESTED ? [s.CANCELLED] : [];
  }
}
export default SrStatusTransitionValidator;
