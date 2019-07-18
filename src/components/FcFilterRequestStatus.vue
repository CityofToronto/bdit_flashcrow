<template>
  <TdsChecklistDropdown
    class="fc-filter-request-status"
    :class="{
      'tds-button-success': hasFilterRequestStatus,
    }"
    name="requestStatus"
    :options="options"
    v-model="filterRequestStatus">
    <span>
      Request Status
      <span
        class="tds-badge"
        :class="{
          'tds-badge-success': hasFilterRequestStatus,
        }">
        {{filterRequestStatus.length}}
      </span>
    </span>
  </TdsChecklistDropdown>
</template>

<script>
import { mapGetters } from 'vuex';

import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import { RequestStatus } from '@/lib/Constants';

export default {
  name: 'FcFilterRequestStatus',
  components: {
    TdsChecklistDropdown,
  },
  data() {
    const options = Object.keys(RequestStatus)
      .map(value => ({ label: value, value }));
    return { options };
  },
  computed: {
    filterRequestStatus: {
      get() {
        return this.$store.state.filterRequestStatus;
      },
      set(filterRequestStatus) {
        this.$store.commit('setFilterRequestStatus', filterRequestStatus);
      },
    },
    ...mapGetters(['hasFilterRequestStatus']),
  },
};
</script>

<style lang="postcss">
.fc-filter-request-status {
  & > .dropdown {
    width: 400px;
  }
}
</style>
