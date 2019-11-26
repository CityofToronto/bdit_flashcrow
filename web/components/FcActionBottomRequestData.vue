<template>
  <button
    class="tds-button-primary"
    @click="onClickRequestData"
    :disabled="$v.$invalid">
    <span>Request Data </span>
    <span class="tds-badge tds-badge-primary">{{studyRequest.studies.length}}</span>
  </button>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FcActionBottomRequestData',
  computed: {
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    ...mapState(['studyRequest']),
  },
  validations: {
    studyRequest: {
      notEmpty: value => value.studies.length > 0,
    },
  },
  methods: {
    onClickRequestData() {
      let { name } = this.$route;
      name = `${name}Schedule`;
      const route = { name };
      if (this.isSupervisor) {
        route.query = { isSupervisor: true };
      }
      this.$router.push(route);
    },
  },
};
</script>
