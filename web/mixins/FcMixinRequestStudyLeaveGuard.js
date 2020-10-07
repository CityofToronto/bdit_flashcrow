import FcDialogConfirmRequestStudyLeave
  from '@/web/components/dialogs/FcDialogConfirmRequestStudyLeave.vue';

export default {
  components: {
    FcDialogConfirmRequestStudyLeave,
  },
  data() {
    return {
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
    }
  },
  methods: {
    actionLeave() {
      this.leaveConfirmed = true;
      this.$router.push(this.nextRoute);
    },
    actionNavigateBack(leaveConfirmed = false) {
      this.leaveConfirmed = leaveConfirmed;
      this.$router.push(this.$refs.nav.routeNavigateBack);
    },
  },
};
