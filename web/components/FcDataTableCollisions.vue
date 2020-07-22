<template>
  <div class="align-end d-flex mb-5 mx-5">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <div class="flex-grow-1 flex-shrink-1">
        <div class="font-weight-regular title">
          Amount
        </div>
        <div class="display-2 mt-2">
          {{collisionSummary.amount}}
        </div>
      </div>
      <div class="flex-grow-1 flex-shrink-1">
        <div class="font-weight-regular title">
          KSI
        </div>
        <div class="display-2 mt-2">
          {{collisionSummary.ksi}}
        </div>
      </div>
      <div class="flex-grow-0 flex-shrink-0 mr-12 pr-2">
        <div class="font-weight-regular title">
          Validated
        </div>
        <div class="display-2 mt-2">
          {{collisionSummary.validated}}
        </div>
      </div>
      <FcButton
        class="flex-grow-0 flex-shrink-0"
        type="tertiary"
        :disabled="collisionSummary.amount === 0"
        @click="$emit('show-reports', item)">
        <span>View Reports</span>
      </FcButton>
    </template>
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDataTableCollisions',
  components: {
    FcButton,
    // FcDataTable,
  },
  props: {
    collisionSummary: Object,
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const columns = [{
      value: 'AMOUNT',
      text: 'Amount',
    }, {
      value: 'KSI',
      text: 'KSI',
    }, {
      value: 'VALIDATED',
      text: 'Validated',
    }, {
      align: 'end',
      value: 'VIEW_REPORT',
      text: ' ',
    }];
    return {
      columns,
    };
  },
};
</script>

<style lang="scss">
.fc-data-table-collisions {
  & th:first-child,
  & td:first-child {
    padding-left: 20px;
  }
  & th:last-child,
  & td:last-child {
    padding-right: 20px;
  }
}
</style>
