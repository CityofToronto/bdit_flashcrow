const SELECTOR_INPUT = 'button, input';

export default {
  mounted() {
    this.autofocus();
  },
  methods: {
    autofocus() {
      let $autofocus = this.$refs.autofocus.$el;
      if (!$autofocus.matches(SELECTOR_INPUT)) {
        $autofocus = $autofocus.querySelector(SELECTOR_INPUT);
      }
      $autofocus.focus();
    },
  },
};
