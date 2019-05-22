import Vue from 'vue';
import VueCalendar from 'v-calendar';
import Vuelidate from 'vuelidate';
import VueSelect from 'vue-select';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import TimeFormatters from '@/lib/time/TimeFormatters';

Vue.use(VueCalendar);
Vue.use(Vuelidate);
Vue.component('v-select', VueSelect);

Vue.filter('date', TimeFormatters.formatDefault);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
