import Vue from 'vue';
import Vuelidate from 'vuelidate';
import Vuetify from 'vuetify/lib/framework';
import en from 'vuetify/es5/locale/en';

import { formatDuration, formatUsername } from '@/lib/StringFormatters';
import NumberFormatters from '@/lib/i18n/NumberFormatters';
import TimeFormatters from '@/lib/time/TimeFormatters';
import App from '@/web/App.vue';
import analyticsClient from '@/web/analytics/analyticsClient';
import router from '@/web/router';
import store from '@/web/store';

Vue.use(Vuelidate);
Vue.use(Vuetify);

Vue.filter('date', TimeFormatters.formatDefault);
Vue.filter('dateTime', TimeFormatters.formatDateTime);
Vue.filter('dayOfWeek', TimeFormatters.formatDayOfWeek);
Vue.filter('daysOfWeek', TimeFormatters.formatDaysOfWeek);
Vue.filter('durationHuman', formatDuration);
Vue.filter('number', NumberFormatters.formatDefault);
Vue.filter('timeOfDay', TimeFormatters.formatTimeOfDay);
Vue.filter('username', formatUsername);

Vue.config.productionTip = false;

function getCspNonce() {
  const $cspNonce = document.querySelector('meta[name=csp-nonce]');
  if ($cspNonce === null) {
    return null;
  }
  return $cspNonce.getAttribute('content');
}
const cspNonce = getCspNonce();

/*
 * Vuetify offers two major entry points to customization: SASS variables (as in
 * `styles/variables.scss`) and JavaScript options.
 *
 * In JavaScript options, we can define custom colors for light and dark themes.
 * By also enabling `customProperties`, we can use these colors in several ways:
 *
 * - via classes (`.{color}` for backgrounds, `.{color}--text` for text);
 * - via CSS variables (`--v-{color}-{shade}`);
 * - via JavaScript (`this.$vuetify.theme.themes.light.primary`).
 *
 * This offers us flexibility in developing a standard look-and-feel across the application.
 */
const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
  lang: {
    locales: { en },
    current: 'en',
  },
  theme: {
    options: {
      cspNonce,
      customProperties: true,
    },
    themes: {
      light: {
        // main colors
        default: '#272727',
        primary: '#005695',
        secondary: '#696969',
        // off-white accents
        shading: '#fafafa',
        border: '#e0e0e0',
        unselected: '#acacac',
        // status colors
        error: '#df323b', // in default Vuetify: 'error darken-1'
        success: '#00791e', // in default Vuetify: 'success darken-2'
        // request status
        statusRequested: '#2ec3cc',
        statusChangesNeeded: '#c0392e',
        statusCancelled: '#e0e0e0',
        statusAssigned: '#fed330',
        statusRejected: '#404040',
        statusCompleted: '#26de81',
      },
    },
  },
});

/*
 * Inject the singleton analytics client into all Vue components as `this.$analytics`.
 * See https://vuejs.org/v2/guide/plugins.html#Writing-a-Plugin for why this works.
 *
 * Note that, at this point, `analyticsClient.appContext === null`.
 */
Object.defineProperty(Vue.prototype, '$analytics', {
  get() { return analyticsClient; },
});

const appContext = new Vue({
  render: h => h(App),
  router,
  store,
  vuetify,
}).$mount('#app');

/*
 * Once the application context has been created above, set that context in our
 * singleton analytics client.
 *
 * Note that, due to the tick-based nature of Vue rendering, this will be called
 * before any components actually render, and definitely before `router.afterEach()`
 * is reached.  This allows us to ensure that `analyticsClient.appContext !== null`
 * before any analytics events are sent.
 *
 * This two-stage init / set approach is necessary to avoid a circular dependency
 * between the application context and the analytics client.
 */
analyticsClient.setAppContext(appContext);
