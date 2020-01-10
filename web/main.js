import { format } from 'd3-format';
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import VueCalendar from 'v-calendar';
import Vuelidate from 'vuelidate';

import App from '@/web/App.vue';
import router from '@/web/router';
import store from '@/web/store';
import { formatDuration } from '@/lib/StringFormatters';
import TimeFormatters from '@/lib/time/TimeFormatters';

Vue.use(Vuetify);
Vue.use(VueCalendar);
Vue.use(Vuelidate);

Vue.filter('durationHuman', formatDuration);

Vue.filter('date', TimeFormatters.formatDefault);
Vue.filter('dateTime', TimeFormatters.formatDateTime);
Vue.filter('dayOfWeek', TimeFormatters.formatDayOfWeek);
Vue.filter('d3Format', (value, formatSpec) => format(formatSpec)(value));
Vue.filter('timeOfDay', TimeFormatters.formatTimeOfDay);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
  router,
  store,
  vuetify: new Vuetify({}),
}).$mount('#app');
