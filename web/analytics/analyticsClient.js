import { v4 as uuidv4 } from 'uuid';

import { AnalyticsEventType } from '@/web/analytics/AnalyticsTypes';

const STORAGE_KEY_VISITOR_ID = 'ca.toronto.move.visitorId';

/**
 * Client for Oracle Infinity.  Wraps the Data Collection API in an interface that makes
 * it easier to log important interaction events throughout MOVE.
 *
 * Note that event sending is asynchronous.  It is recommended that you avoid blocking user
 * interaction wherever possible.  This usually means calling `send(events)` *without* `await`,
 * or at least waiting until the user-facing changes resulting from that interaction have
 * taken place to send the events.
 *
 * One exception is in actions that load a different page, such as the sign in / sign out
 * actions.  In those cases, it is acceptable to `await send(events)` to prevent a race
 * between the page load and the analytics API request.  Note, however, that this cannot
 * be reliably done from within native event handlers (e.g. `onsubmit`).
 *
 * @param {string} accountId - Oracle Infinity account ID
 * @param {string} dcsId - Oracle Infinity tag ID
 * @example
 * const event = analyticsClient.buttonEvent();
 * // within a component: this.$analytics.buttonEvent()
 * await analyticsClient.send([event]);
 */
class AnalyticsClient {
  constructor(accountId, dcsId) {
    this.accountId = accountId;
    this.appContext = null;
    this.analyticsDomain = AnalyticsClient.getAnalyticsDomain();
    this.dcsId = dcsId;
    this.userLanguage = AnalyticsClient.getUserLanguage();
    this.visitorId = AnalyticsClient.getVisitorId();
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
   * Finds the closest containing `<div>` or `<table>` to `$el`, then returns its ID or class
   * as an identifier for that container.
   *
   * This is used in button click tracking to help identify where in the interface the user is
   * clicking.
   *
   * @param {Element} $el
   * @returns {string?} identifier as described above, or `null` if either no such container
   * element exists or that container element lacks both `id` and `class` attributes
   * @see https://docs.oracle.com/en/cloud/saas/marketing/infinity-user/Help/parameters/div_table.htm
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
   * Given route parameters, extracts a series of content subgroups.  This is used alongside
   * `wt.cg_n` - we're using the content group / subgroup feature to store information about
   * which application route is active.
   *
   * One issue here is that content subgroups are treated as a sequential list in the Oracle
   * Infinity dashboard, but for analytics purposes these would best be considered independent
   * dimensions.  To correct that, we will likely need to define custom parameters.
   *
   * @param {Object} params - route params to extract content subgroups from
   * @returns {Array<string>} list of content subgroups
   * @see https://docs.oracle.com/en/cloud/saas/marketing/infinity-user/Help/parameters/content_group.htm#wt.cg_s
   */
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

  /**
   * @returns {string} screen resolution, in `${width}x${height}` format
   * @see https://docs.oracle.com/en/cloud/saas/marketing/infinity-user/Help/parameters/web-client.htm#wt.sr
   */
  static getScreenResolution() {
    const { height, width } = window.screen;
    return `${width}x${height}`;
  }

  /**
   * @returns {string} current page title
   * @see https://docs.oracle.com/en/cloud/saas/marketing/infinity-user/Help/parameters/title.htm
   */
  static getTitle() {
    const { title } = window.document;
    return title;
  }

  /**
   * @returns {string} current user language
   * @see https://docs.oracle.com/en/cloud/saas/marketing/infinity-user/Help/parameters/web-client.htm#wt.ul
   */
  static getUserLanguage() {
    const { language } = window.navigator;
    return language;
  }

  /**
   * Returns a unique anonymous visitor ID.  This ID is not related in any way to user
   * credentials, and does not need to be kept secret.
   *
   * If possible, uses `window.localStorage` to persist this visitor ID across separate sessions
   * in the same browser.  (This is not quite the same as sessions for the same user, but is
   * probably the best we can do without compromising the "anonymous" part.)
   *
   * @returns {string} visitor ID
   */
  static getVisitorId() {
    try {
      let visitorId = window.localStorage.getItem(STORAGE_KEY_VISITOR_ID);
      if (visitorId === null) {
        visitorId = uuidv4();
        window.localStorage.setItem(STORAGE_KEY_VISITOR_ID, visitorId);
      }
      return visitorId;
    } catch (err) {
      /*
       * In this case, `window.localStorage` is likely missing or unavailable.  Since the result
       * is stored in `this.visitorId` once during construction, and since we keep the same
       * `AnalyticsClient` while the page is open, we can generate a new UUID here and at least
       * group all user actions in the same page load under the same visitor.
       */
      return uuidv4();
    }
  }

  // EVENTS

  /**
   * Handles event parameters common to all event types, and combines them with
   * type-specific parameters to form ready-to-send analytics events.
   *
   * @param {AnalyticsEventType} eventType - determines value of `wt.dl` event-tracking
   * parameter
   * @param {Object<string, string>} eventOptions - additional options to include in the
   * event; can use this to override common parameters as well
   */
  event(eventType, eventOptions) {
    if (this.appContext === null) {
      throw new Error('must call setAppContext() before event()');
    }

    const { name, params, path } = this.appContext.$route;
    const now = new Date();

    /*
     * Note that all values here are strings - numeric values (e.g. time-related details)
     * must be converted using `.toString()`.
     */
    const event = {
      dcsuri: path,
      /*
       * Hour of day in browser-local time.  Used to see daily usage patterns.
       */
      'wt.bh': now.getHours().toString(),
      /*
       * As noted elsewhere, we use content groups and subgroups to store information about the
       * active route.
       */
      'wt.cg_n': name,
      'wt.cg_s': AnalyticsClient.getContentSubgroups(params),
      'wt.dl': eventType.code,
      /*
       * From testing via `curl` and the Oracle Infinity dashboard, `wt.es` must be present, and
       * should be set to `{domain}{path}` as here.  (No idea what happens, or what might break,
       * if this invariant is not kept.)
       */
      'wt.es': `${this.analyticsDomain}${path}`,
      /*
       * Timestamp in UNIX epoch seconds (not milliseconds, as the docs claim!)
       */
      'wt.ets': Math.floor(now.valueOf() / 1000).toString(),
      /*
       * We fetch screen resolution on each event, as it is possible for users with multi-screen
       * setups to move the browser window to a different screen between analytics events.
       */
      'wt.sr': AnalyticsClient.getScreenResolution(),
      'wt.ti': AnalyticsClient.getTitle(),
      /*
       * Timezone offset, in hours.  A negative value indicates that local time is earlier than UTC,
       * hence the negation of `now.getTimezoneOffset()`.
       */
      'wt.tz': Math.floor(-now.getTimezoneOffset() / 60).toString(),
      ...eventOptions,
    };
    return event;
  }

  /**
   * Oracle Infinity's conceptual model is rooted in page loads ("views").  As an SPA, MOVE's
   * equivalent is `vue-router` transitions, so we log these in the `router.afterEach()` hook.
   *
   * @returns {Object<string, string>} event representing a page load or route transition
   */
  appRouteEvent() {
    return this.event(AnalyticsEventType.APP_ROUTE, {});
  }

  /**
   * Used to capture button clicks.  Here we use the "form button click" event type - even
   * though most button interactions in MOVE don't involve `<form>` elements, this allows those
   * interactions to show up in the dashboard as clicks.
   *
   * @param {string} ihtml - textual representation of button
   * @param {Element} $el - root element of button component
   * @returns {Object<string, string>} event representing a button click
   */
  buttonEvent(ihtml, $el) {
    const nv = AnalyticsClient.getContainerIdentifier($el) || 'app';

    const eventOptions = {
      'wt.ihtml': ihtml,
      'wt.nv': nv,
      'wt.z_url': 'NaN',
    };
    return this.event(AnalyticsEventType.BUTTON_CLICK, eventOptions);
  }

  /**
   * Used to capture location search interactions.  Here we use the "form GET action" event
   * type - again, this isn't in a `<form>`, and as an SPA MOVE relies more on AJAX-y API
   * calls, but this allows us to record these in a way visible to Oracle Infinity.
   *
   * @param {string} query - query sent to the backend
   * @param {number} numResults - number of results returned from the search backend, or 0
   * if the search was unsuccessful
   * @returns {Object<string, string>} event representing a location search
   */
  locationSearchEvent(query, numResults) {
    const eventOptions = {
      dcsuri: '/api/locations/suggest',
      query,
      'wt.es': `${this.analyticsDomain}/api/locations/suggest`,
      'wt.ihtml': 'Search',
      'wt.nv': 'fc-input-location-search',
      'wt.oss': query,
      'wt.oss_r': numResults,
      'wt.search-term': query,
      'wt.z_url': 'NaN',
    };
    return this.event(AnalyticsEventType.LOCATION_SEARCH, eventOptions);
  }

  /**
   * Sign in event - either from an explicit click on the user "Sign In" button at bottom
   * left, or via auto-redirect when the user navigates to a part of MOVE that requires
   * authentication (e.g. Track Requests).
   *
   * In the explicit click case, we'll also see a button click event from that button; this
   * helps us understand how many sign in events are explicit vs. automatic.
   *
   * @returns {Object<string, string>} event representing a user sign-in
   */
  signInEvent() {
    const eventOptions = {
      dcsuri: '/api/auth/adfs-init',
      'wt.es': `${this.analyticsDomain}/api/auth/adfs-init`,
      'wt.ihtml': 'Sign In',
      'wt.nv': 'auth',
      'wt.z_url': 'NaN',
    };
    return this.event(AnalyticsEventType.SIGN_IN, eventOptions);
  }

  /**
   * Sign out event from the bottom left user dropdown.
   *
   * @returns {Object<string, string>} event representing a user sign-out
   */
  signOutEvent() {
    const eventOptions = {
      dcsuri: '/api/auth/logout',
      'wt.es': `${this.analyticsDomain}/api/auth/logout`,
      'wt.ihtml': 'Sign Out',
      'wt.nv': 'auth',
      'wt.z_url': 'NaN',
    };
    return this.event(AnalyticsEventType.SIGN_OUT, eventOptions);
  }

  /**
   * Sends one or more events to Oracle Infinity.
   *
   * This method should *never* throw an error; if events are malformed, or the Oracle Infinity
   * service is unreachable, the rest of MOVE should continue to function.  We currently wrap
   * the `window.fetch` call in a try-catch block, and might eventually wrap other parts in
   * that same block.
   *
   * @param {Array<Object<string, string>>} events - events to send
   */
  async send(events) {
    if (events.length === 0) {
      return;
    }

    const url = `https://dc.oracleinfinity.io/v3/${this.accountId}`;
    const data = {
      events,
      static: {
        dcssip: this.analyticsDomain,
        'wt.co_f': this.visitorId,
        'wt.dcsid': this.dcsId,
        'wt.ul': this.userLanguage,
        'wt.vtid': this.visitorId,
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

/**
 * Singleton analytics client instance, for use across the application.
 *
 * We include the account and tag IDs here, as these are not intended to be secret; indeed,
 * when loading the Oracle Infinity `<script>` tag, both values are easily accessible in
 * plaintext from the browser.  This is deliberate, as it means we can send analytics
 * events directly to Oracle Infinity without needing to store them ourselves.
 *
 * @type {AnalyticsClient}
 */
const analyticsClient = new AnalyticsClient(
  '97j62divdr',
  'dcs222ldvxk938tpne9uk1e3u_1c4g',
);
export default analyticsClient;
