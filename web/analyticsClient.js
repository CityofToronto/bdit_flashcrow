import { v4 as uuidv4 } from 'uuid';

import { Enum } from '@/lib/ClassUtils';

class AnalyticsEventType extends Enum {}
AnalyticsEventType.init({
  API_GET: {
    code: '26',
  },
  CLICK: {
    code: '1',
  },
  DOWNLOAD: {
    code: '20',
  },
  PAGE_VIEW: {
    code: '0',
  },
});

const STORAGE_KEY_VISITOR_ID = 'ca.toronto.move.visitorId';

class VisitorId {
  static get() {
    let visitorId = window.localStorage.getItem(STORAGE_KEY_VISITOR_ID);
    if (visitorId === null) {
      visitorId = uuidv4();
      window.localStorage.setItem(STORAGE_KEY_VISITOR_ID, visitorId);
    }
    return visitorId;
  }
}

/**
 * Client for Oracle Infinity.  Wraps the Data Collection API in an interface that makes
 * it easier to log important interaction events throughout MOVE.
 *
 * @param {string} accountId - Oracle Infinity account ID
 * @param {string} dcsId - additional Oracle Infinity identifier
 */
class AnalyticsClient {
  constructor(accountId, dcsId) {
    this.accountId = accountId;
    this.appContext = null;
    this.analyticsDomain = AnalyticsClient.getAnalyticsDomain();
    this.dcsId = dcsId;
    this.userLanguage = AnalyticsClient.getUserLanguage();
  }

  /**
   * @param {Vue} appContext - Vue application context, used to fetch application-wide
   * information such as current route, whether the user is logged in, etc.
   */
  setAppContext(appContext) {
    this.appContext = appContext;
  }

  // GLOBAL / BROWSER STATE HELPERS

  /**
   * Returns current page domain for analytics purposes.  In some cases (e.g. spinning up a new
   * environment, testing in local development) this can be different from the *actual* page domain
   * as returned by `window.document.domain`.
   *
   * @returns {string} domain (see above)
   */
  static getAnalyticsDomain() {
    const { domain } = window.document;
    if (domain === 'localhost') {
      // TODO: remove this once we've tested everything, but keep the function so we have a
      // layer of indirection in case we need to do something like this
      return 'move.intra.dev-toronto.ca';
    }
    return domain;
  }

  /**
   * @returns {string} screen resolution, in `${width}x${height}` format
   */
  static getScreenResolution() {
    const { height, width } = window.screen;
    return `${width}x${height}`;
  }

  /**
   * @returns {string} current page title
   */
  static getTitle() {
    const { title } = window.document;
    return title;
  }

  /**
   * @returns {string} current user language
   */
  static getUserLanguage() {
    const { language } = window.navigator;
    return language;
  }

  // ROUTER STATE HELPERS

  static getContentSubgroups(params) {
    const contentSubgroups = [];
    if (Object.prototype.hasOwnProperty.call(params, 'selectionTypeName')) {
      contentSubgroups.push(params.selectionTypeName);
    }
    if (Object.prototype.hasOwnProperty.call(params, 'studyTypeName')) {
      contentSubgroups.push(params.studyTypeName);
    }
    return contentSubgroups;
  }

  // EVENTS

  event(eventType, options) {
    if (this.appContext === null) {
      throw new Error('must call setAppContext() before event()');
    }

    const { name, params, path } = this.appContext.$route;
    const now = new Date();

    const event = {
      dcsuri: path,
      'wt.bh': now.getHours(),
      'wt.cg_n': name,
      'wt.dl': eventType.code,
      'wt.es': `${this.analyticsDomain}${path}`,
      'wt.ets': Math.floor(now.valueOf() / 1000),
      'wt.sr': AnalyticsClient.getScreenResolution(),
      'wt.ti': AnalyticsClient.getTitle(),
      'wt.tz': Math.floor(-now.getTimezoneOffset() / 60),
      ...options,
    };

    let contentSubgroups = AnalyticsClient.getContentSubgroups(params);
    if (contentSubgroups.length > 0) {
      if (Object.prototype.hasOwnProperty.call(event, 'wt.cg_s')) {
        const parts = event['wt.cg_s'].split(';');
        contentSubgroups = [...parts, ...contentSubgroups];
      }
      event['wt.cg_s'] = contentSubgroups.join(';');
    }
    return event;
  }

  locationSearchEvent(query, results) {
    return this.event(AnalyticsEventType.API_GET, {
      'wt.oss': query,
      'wt.oss_r': results.length.toString(),
    });
  }

  routeEvent() {
    return this.event(AnalyticsEventType.PAGE_VIEW, {});
  }

  async send(events) {
    const url = `https://dc.oracleinfinity.io/v3/${this.accountId}`;

    const visitorId = VisitorId.get();
    const data = {
      events,
      static: {
        dcssip: this.analyticsDomain,
        'wt.co_f': visitorId,
        'wt.dcsid': this.dcsId,
        'wt.ria_a': 'MOVE',
        'wt.ul': this.userLanguage,
        'wt.vtid': visitorId,
      },
    };
    const body = JSON.stringify(data);
    const options = {
      body,
      credentials: 'include',
      method: 'POST',
    };
    await fetch(url, options);
  }
}

const analyticsClient = new AnalyticsClient(
  '97j62divdr',
  'dcs222ldvxk938tpne9uk1e3u_1c4g',
);
export default analyticsClient;
