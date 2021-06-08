import Vue from 'vue';

import { focusInput } from '@/web/ui/FormUtils';

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
      const $autofocus = autofocus.$el;
      focusInput($autofocus);
    },
  },
};
