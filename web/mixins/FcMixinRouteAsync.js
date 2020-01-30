export default {
  data() {
    return {
      loading: true,
    };
  },
  created() {
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
