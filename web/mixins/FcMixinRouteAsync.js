export default {
  data() {
    return {
      loading: true,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.loadAsync(to);
    });
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
