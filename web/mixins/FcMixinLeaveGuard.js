export default {
  data() {
    return {
      leaveConfirmed: false,
      nextRoute: null,
      showConfirmLeave: false,
    };
  },
  beforeRouteLeave(to, from, next) {
    if (this.leaveConfirmed) {
      next();
    } else {
      this.nextRoute = to;
      this.showConfirmLeave = true;
      next(false);
    }
  },
  methods: {
    actionLeave() {
      this.leaveConfirmed = true;
      this.$router.push(this.nextRoute);
    },
    actionNavigateBack(leaveConfirmed = false) {
      this.leaveConfirmed = leaveConfirmed;
      this.$router.push(this.routeNavigateBack);
    },
  },
};
