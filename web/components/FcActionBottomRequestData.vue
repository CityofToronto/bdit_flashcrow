<template>
  <v-btn
    color="primary"
    :disabled="$v.$invalid"
    @click="onClickRequestData">
    Request Data ({{studyRequest.studies.length}})
  </v-btn>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FcActionBottomRequestData',
  computed: {
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    ...mapState('requestStudy', ['studyRequest']),
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
