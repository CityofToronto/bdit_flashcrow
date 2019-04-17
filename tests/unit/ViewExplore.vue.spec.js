import VueCalendar from 'v-calendar';
import VueSelect from 'vue-select';
import { mount, createLocalVue } from '@vue/test-utils';
import Vuex from 'vuex';

import router from '@/router';
import ViewExplore from '@/views/ViewExplore.vue';

const localVue = createLocalVue();
localVue.use(VueCalendar);
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

test('ViewExplore.vue renders properly', () => {
  const component = mount(ViewExplore, {
    localVue,
    propsData: { },
    router,
    store,
  });
  expect(component.contains('div')).toBe(true);
});
