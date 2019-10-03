import { format } from 'd3-format';
import Vue from 'vue';
import VueCalendar from 'v-calendar';
import Vuelidate from 'vuelidate';
// polyfill fetch()
import 'whatwg-fetch';

import App from '@/src/App.vue';
import router from '@/src/router';
import store from '@/src/store';
import StringFormatters from '@/lib/StringFormatters';
import TimeFormatters from '@/lib/time/TimeFormatters';

Vue.use(VueCalendar);
Vue.use(Vuelidate);

Vue.filter('durationHuman', StringFormatters.formatDuration);

Vue.filter('date', TimeFormatters.formatDefault);
Vue.filter('dayOfWeek', TimeFormatters.formatDayOfWeek);
Vue.filter('d3Format', (value, formatSpec) => format(formatSpec)(value));
Vue.filter('timeOfDay', TimeFormatters.formatTimeOfDay);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
