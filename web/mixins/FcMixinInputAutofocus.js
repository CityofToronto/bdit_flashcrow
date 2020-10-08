import Vue from 'vue';

const SELECTOR_INPUT = 'button, input';

export default {
  mounted() {
    Vue.nextTick(() => this.autofocus());
  },
  methods: {
    autofocus() {
      const { autofocus } = this.$refs;
      if (autofocus === undefined) {
        return;
      }
      let $autofocus = autofocus.$el;
      if (!$autofocus.matches(SELECTOR_INPUT)) {
        $autofocus = $autofocus.querySelector(SELECTOR_INPUT);
      }
      $autofocus.focus();
    },
  },
};
