import BootstrapVue from 'bootstrap-vue';
import VueDatepicker from 'vuejs-datepicker';
import VueSelect from 'vue-select';
import { shallowMount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import Home from '@/views/Home.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.component('v-datepicker', VueDatepicker);
localVue.component('v-select', VueSelect);
localVue.use(Vuex);

let store;

beforeEach(() => {
  // TODO: DRY with store.js
  store = new Vuex.Store({
    state: {
      counter: 0,
      auth: {
        loggedIn: false,
      },
      query: '',
      filterCountTypes: [],
      filterDate: null,
      showMap: true,
    },
  });
});

test('Home.vue renders properly', () => {
  const wrapper = shallowMount(Home, {
    propsData: { },
    store,
    localVue,
  });
  expect(wrapper.contains('div')).toBe(true);
});
