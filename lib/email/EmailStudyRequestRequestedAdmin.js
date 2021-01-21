import { LocationSelectionType } from '@/lib/Constants';
import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';
import EmailStudyRequestUtils from '@/lib/email/EmailStudyRequestUtils';
import CompositeId from '@/lib/io/CompositeId';

/**
 * Notifies the Data Collection team that a new study request has been requested.  This is sent
 * immediately upon completion of the single-location Request Study user flow in the frontend.
 */
class EmailStudyRequestRequestedAdmin extends EmailBaseStudyRequest {
  /* eslint-disable-next-line class-methods-use-this */
  getRecipients() {
    return [
      EmailBase.TO_DATA_COLLECTION,
    ];
  }

  getSubject() {
    if (this.location === null) {
      return '[MOVE] New request';
    }
    const { description } = this.location;
    return `[MOVE] New request for ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        A request has been submitted for the following study
        {{#location}}
          to be conducted at
          <a href="{{hrefLocation}}>{{location}}</a>
        {{/location}}:
      </p>
      <p>
        <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
      </p>
      <p>
        <a href="{{hrefStudyRequest}}">View request</a>
      </p>
    </div>`;
  }

  getBodyParams() {
    const { id } = this.studyRequest;
    const hrefStudyRequest = EmailBase.getUrl(`requests/study/${id}`);

    /*
     * If this study somehow refers to a centreline feature that no longer exists, we can
     * still send out the email without crashing.
     *
     * In this particular case, this is *extremely* unlikely.  The centreline would have to
     * be updated by our pipelines sometime between when the user starts the new study request
     * flow and when the email is sent out, and that update would have to remove the centreline
     * feature that the user has selected.
     */
    let location = null;
    let hrefLocation = null;
    if (this.location !== null) {
      location = this.location.description;
      const s1 = CompositeId.encode([this.location]);
      const selectionType = LocationSelectionType.POINTS;
      hrefLocation = EmailBase.getUrl(`/view/location/${s1}/${selectionType.name}`);
    }

    const days = EmailStudyRequestUtils.renderDays(this.studyRequest);
    const hours = EmailStudyRequestUtils.renderHours(this.studyRequest);
    const { studyType: { label: studyType } } = this.studyRequest;

    return {
      days,
      hrefLocation,
      hrefStudyRequest,
      hours,
      location,
      studyType,
    };
  }
}

export default EmailStudyRequestRequestedAdmin;
