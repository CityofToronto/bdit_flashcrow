import { format } from 'd3-format';
import Vue from 'vue';
import VueCalendar from 'v-calendar';
import Vuelidate from 'vuelidate';

import App from '@/web/App.vue';
import router from '@/web/router';
import store from '@/web/store';
import { formatDuration } from '@/lib/StringFormatters';
import TimeFormatters from '@/lib/time/TimeFormatters';

Vue.use(VueCalendar);
Vue.use(Vuelidate);

Vue.filter('durationHuman', formatDuration);

Vue.filter('date', TimeFormatters.formatDefault);
Vue.filter('dayOfWeek', TimeFormatters.formatDayOfWeek);
Vue.filter('d3Format', (value, formatSpec) => format(formatSpec)(value));
Vue.filter('timeOfDay', TimeFormatters.formatTimeOfDay);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
