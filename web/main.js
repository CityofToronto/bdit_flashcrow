import { format } from 'd3-format';
import Vue from 'vue';
import Vuelidate from 'vuelidate';
import Vuetify from 'vuetify/lib/framework';
import en from 'vuetify/es5/locale/en';

import App from '@/web/App.vue';
import router from '@/web/router';
import store from '@/web/store';
import { formatDuration } from '@/lib/StringFormatters';
import TimeFormatters from '@/lib/time/TimeFormatters';

Vue.use(Vuelidate);
Vue.use(Vuetify);

Vue.filter('durationHuman', formatDuration);

Vue.filter('date', TimeFormatters.formatDefault);
Vue.filter('dateTime', TimeFormatters.formatDateTime);
Vue.filter('dayOfWeek', TimeFormatters.formatDayOfWeek);
Vue.filter('daysOfWeek', TimeFormatters.formatDaysOfWeek);
Vue.filter('d3Format', (value, formatSpec) => format(formatSpec)(value));
Vue.filter('timeOfDay', TimeFormatters.formatTimeOfDay);

Vue.config.productionTip = false;

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
  lang: {
    locales: { en },
    current: 'en',
  },
  theme: {
    options: {
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
        // request status
        statusRequested: '#2ec3cc',
        statusChangesNeeded: '#404040',
        statusCancelled: '#e0e0e0',
        statusAssigned: '#fed330',
        statusRejected: '#c0392e',
        statusCompleted: '#26de81',
      },
    },
  },
});

new Vue({
  render: h => h(App),
  router,
  store,
  vuetify,
}).$mount('#app');
