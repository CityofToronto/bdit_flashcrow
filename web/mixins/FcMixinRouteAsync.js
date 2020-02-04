export default {
  data() {
    return {
      loading: true,
    };
  },
  created() {
    /*
     * We use `created()` instead of `beforeRouteEnter()` here for two reasons: it
     * reduces time-to-interact, and it works better with hot-reload.  Hot reloading
     * neither re-enters nor updates the current route, but it *does* re-create the
     * relevant component.
     */
    this.loadAsync(this.$route);
  },
  async beforeRouteUpdate(to, from, next) {
    await this.loadAsync(to);
    next();
  },
  methods: {
    async loadAsync(to) {
      this.loading = true;
      await this.loadAsyncForRoute(to);
      this.loading = false;
    },
  },
};
