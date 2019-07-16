<template>
  <TdsChecklistDropdown
    class="fc-filter-request-status"
    name="requestStatus"
    :options="options"
    v-model="filterRequestStatus">
    <span>
      Request Status
      <span class="tds-badge">
        {{filterRequestStatus.length}}
      </span>
    </span>
  </TdsChecklistDropdown>
</template>

<script>
import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import { REQUEST_STATUS_VARIANTS } from '@/lib/Constants';

export default {
  name: 'FcFilterRequestStatus',
  components: {
    TdsChecklistDropdown,
  },
  data() {
    const options = Object.keys(REQUEST_STATUS_VARIANTS)
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
