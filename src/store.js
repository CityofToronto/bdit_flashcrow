import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    counter: 0,
    loading: false,
  },
  mutations: {
    setCounter(state, counter) {
      Vue.set(state, 'counter', counter);
    },
    startLoading(state) {
      Vue.set(state, 'loading', true);
    },
    stopLoading(state) {
      Vue.set(state, 'loading', false);
    },
  },
  actions: {
    incrementCounter({ commit }) {
      const options = {
        method: 'PUT',
      };
      commit('startLoading');
      return fetch('/api/counter', options)
        .then(response => response.json())
        .then(({ counter }) => {
          commit('setCounter', counter);
          commit('stopLoading');
        });
    },
    init({ commit }) {
      commit('startLoading');
      return fetch('/api/counter')
        .then(response => response.json())
        .then(({ counter }) => {
          commit('setCounter', counter);
          commit('stopLoading');
        });
    },
  },
});
