import { Enum } from '@/lib/ClassUtils';

/**
 * Maps MOVE event types (e.g. application route, location search) to values for the `wt.dl`
 * parameter in Oracle Infinity's Data Collection API.
 *
 * @param {string} code - value of `wt.dl` for this event type
 * @see https://docs.oracle.com/en/cloud/saas/marketing/infinity-user/Help/parameters/event_tracking.htm
 */
class AnalyticsEventType extends Enum {}
AnalyticsEventType.init({
  APP_ROUTE: {
    code: '0',
  },
  BUTTON_CLICK: {
    code: '29',
  },
  LOCATION_SEARCH: {
    code: '26',
  },
  SIGN_IN: {
    code: '27',
  },
  SIGN_OUT: {
    code: '27',
  },
});

const AnalyticsTypes = {
  AnalyticsEventType,
};

export {
  AnalyticsTypes as default,
  AnalyticsEventType,
};
