import { Enum } from '@/lib/ClassUtils';

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
