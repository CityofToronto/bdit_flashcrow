import { v4 as uuidv4 } from 'uuid';

import { AnalyticsEventType } from '@/web/analytics/AnalyticsTypes';

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

  // HELPER METHODS

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
   * Returns a textual representation of the given button.  Note that this would *not* be a
   * good candidate for Vue computed properties, as the component root element reference
   * `this.$el` is not reactive.
   *
   * @param {Vue} $vm - `<FcButton>` instance
   * @returns {string} text of the button, either `aria-label` for icon buttons or
   * `innerText` for buttons with text
   */
  static getButtonText($vm) {
    if (Object.prototype.hasOwnProperty.call($vm.$attrs, 'aria-label')) {
      return $vm.$attrs['aria-label'];
    }
    return $vm.$el.innerText.trim();
  }

  /**
   * Finds the closest containing `<div>` or `<table>` to `$el`, then returns its ID or class
   * as an identifier for that container.
   *
   * This is used in button click tracking to help identify where in the interface the user is
   * clicking.
   *
   * @param {Element} $el
   * @returns {string?} identifier as described above, or `null` if either no such container
   * element exists or that container element lacks both `id` and `class` attributes
   */
  static getContainerIdentifier($el) {
    const $container = $el.closest('div, table');
    if ($container === null) {
      return null;
    }
    return $container.id
      || $container.className
      || null;
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

  // EVENTS

  event(eventType, eventOptions) {
    if (this.appContext === null) {
      throw new Error('must call setAppContext() before event()');
    }

    const { name, path } = this.appContext.$route;
    const now = new Date();

    const event = {
      dcsuri: path,
      'wt.bh': now.getHours().toString(),
      'wt.cg_n': name,
      'wt.dl': eventType.code,
      'wt.es': `${this.analyticsDomain}${path}`,
      'wt.ets': Math.floor(now.valueOf() / 1000).toString(),
      'wt.sr': AnalyticsClient.getScreenResolution(),
      'wt.ti': AnalyticsClient.getTitle(),
      'wt.tz': Math.floor(-now.getTimezoneOffset() / 60).toString(),
      ...eventOptions,
    };
    return event;
  }

  appRouteEvent() {
    return this.event(AnalyticsEventType.APP_ROUTE, {});
  }

  buttonEvent($vm) {
    const ihtml = AnalyticsClient.getButtonText($vm) || '';
    const nv = AnalyticsClient.getContainerIdentifier($vm.$el) || 'app';

    const eventOptions = {
      'wt.ihtml': ihtml,
      'wt.nv': nv,
      'wt.z_url': 'NaN',
    };
    return this.event(AnalyticsEventType.BUTTON_CLICK, eventOptions);
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
    try {
      await fetch(url, options);
    } catch (err) {
      // TODO: log this error once we have frontend logging functionality
    }
  }
}

const analyticsClient = new AnalyticsClient(
  '97j62divdr',
  'dcs222ldvxk938tpne9uk1e3u_1c4g',
);
export default analyticsClient;
