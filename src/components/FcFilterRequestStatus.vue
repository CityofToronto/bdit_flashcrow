<template>
  <TdsChecklistDropdown
    class="fc-filter-request-status"
    :class="{ 'tds-button-success': active }"
    name="requestStatus"
    :options="options"
    v-model="filterRequestStatus">
    <span>
      Request Status
      <span
        class="tds-badge"
        :class="{ 'tds-badge-success': active }">
        {{filterRequestStatus.length}}
      </span>
    </span>
  </TdsChecklistDropdown>
</template>

<script>
import TdsChecklistDropdown from '@/components/tds/TdsChecklistDropdown.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FcFilterRequestStatus',
  components: {
    TdsChecklistDropdown,
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const options = Constants.REQUEST_STATUS_META
      .map((meta, i) => Object.assign({ value: i }, meta));
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
