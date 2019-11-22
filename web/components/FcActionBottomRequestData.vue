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
      this.$router.push({ name });
    },
  },
};
</script>
