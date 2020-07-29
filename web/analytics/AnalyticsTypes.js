import { Enum } from '@/lib/ClassUtils';

class AnalyticsEventType extends Enum {}
AnalyticsEventType.init({
  APP_ROUTE: {
    code: '0',
  },
  BUTTON_CLICK: {
    code: '29',
  },
});

const AnalyticsTypes = {
  AnalyticsEventType,
};

export {
  AnalyticsTypes as default,
  AnalyticsEventType,
};
