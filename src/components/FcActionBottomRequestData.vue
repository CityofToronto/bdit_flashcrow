<template>
  <button
    class="tds-button-primary"
    @click="onClickRequestData"
    :disabled="$v.$invalid">
    Request Data ({{studyRequest.items.length}})
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
