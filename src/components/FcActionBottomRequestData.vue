<template>
  <button
    class="tds-button-primary"
    @click="onClickRequestData"
    :disabled="$v.$invalid">
    <span>Request Data </span>
    <span class="tds-badge tds-badge-primary">{{studyRequest.items.length}}</span>
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
      notEmpty: value => value.items.length > 0,
    },
  },
  methods: {
    onClickRequestData() {
      this.$router.push({ name: 'requestsNewSchedule' });
    },
  },
};
</script>

<style lang="postcss">

</style>
