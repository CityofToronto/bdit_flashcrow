<template>
  <div class="fc-request-study-request flex-fill">
    <CountsRequestedTable />
    <div class="validation-error" v-if="!$v.dataSelectionEmpty.notEmpty">
      To request data, first select one or more count types to request.
    </div>
    <button
      class="btn-request-data tds-button-primary"
      @click="onClickRequestData">
      Request Data ({{dataSelectionLength}})
    </button>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import CountsRequestedTable from '@/components/CountsRequestedTable.vue';

export default {
  name: 'FcRequestStudyRequest',
  components: {
    CountsRequestedTable,
  },
  computed: {
    ...mapGetters([
      'dataSelectionContains',
      'dataSelectionEmpty',
      'dataSelectionItems',
      'dataSelectionLength',
    ]),
    ...mapState(['counts']),
  },
  validations: {
    dataSelectionEmpty: {
      notEmpty: value => !value,
    },
  },
  methods: {
    onClickRequestData() {
      if (this.$v.$invalid) {
        /* eslint-disable no-alert */
        window.alert('The form contains one or more errors.');
      } else {
        this.$router.push({ name: 'requestsNewSchedule' });
      }
    },
  },
};
</script>

<style lang="postcss">
.fc-request-study-request {
  & > .btn-request-data {
    height: 40px;
    width: 100%;
  }
}
</style>
