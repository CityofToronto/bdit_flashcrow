<template>
  <FcDataTable
    class="fc-data-table-collisions"
    :columns="columns"
    disable-sort
    :loading="loading"
    :items="[collisionSummary]">
    <template v-slot:item.AMOUNT="{ item }">
      <span>{{item.amount}}</span>
    </template>
    <template v-slot:item.KSI="{ item }">
      <span>{{item.ksi}}</span>
    </template>
    <template v-slot:item.VALIDATED="{ item }">
      <span>{{item.validated}}</span>
    </template>
    <template v-slot:header.VIEW_REPORT>
      <span class="sr-only">Reports</span>
    </template>
    <template v-slot:item.VIEW_REPORT="{ item }">
      <FcButton
        type="tertiary"
        @click="$emit('show-reports', item)">
        <span>View Reports</span>
      </FcButton>
    </template>
  </FcDataTable>
</template>

<script>
import FcDataTable from '@/web/components/FcDataTable.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcDataTableCollisions',
  components: {
    FcButton,
    FcDataTable,
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
