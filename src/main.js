import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';
import VueSelect from 'vue-select';

import App from '@/App.vue';
import router from '@/router';
import store from '@/store';

Vue.use(BootstrapVue);
Vue.component('v-select', VueSelect);

Vue.filter('date', (d) => {
  if (!d) {
    return '';
  }
  return new Intl.DateTimeFormat('en-US').format(d);
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
