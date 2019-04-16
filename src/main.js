import Vue from 'vue';
import VueDatepicker from 'vuejs-datepicker';
import VueSelect from 'vue-select';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import TimeFormatters from '@/lib/time/TimeFormatters';

Vue.component('v-datepicker', VueDatepicker);
Vue.component('v-select', VueSelect);

Vue.filter('date', TimeFormatters.formatDate);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
