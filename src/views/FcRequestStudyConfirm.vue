<template>
  <div class="fc-request-study-confirm flex-fill">
    <h2>Your Count Details</h2>
    <CountDetailsSummary
      v-for="(_, i) in dataSelection.items"
      :key="i"
      :index="i" />
    <NewRequestDetailsSummary />
    <button
      class="btn-confirm tds-button-primary"
      @click="onClickConfirm">
      Confirm
    </button>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';
import CountDetailsSummary from '@/components/CountDetailsSummary.vue';
import NewRequestDetailsSummary from '@/components/NewRequestDetailsSummary.vue';

export default {
  name: 'FcRequestStudyConfirm',
  components: {
    CountDetailsSummary,
    NewRequestDetailsSummary,
  },
  computed: {
    estimatedDeliveryDate() {
      if (this.priority === 'URGENT') {
        return null;
      }
      /*
       * For now, the estimated delivery date is the latest midpoint of the date ranges
       * selected in CountDetails.
       *
       * TODO: better delivery date estimates
       * TODO: DRY with NewRequestDetails.vue
       */
      let tMax = new Date().valueOf();
      this.dataSelectionItemsMeta.forEach(({ dateRange }) => {
        let { start, end } = dateRange;
        start = start.valueOf();
        end = end.valueOf();
        const t = Math.round(start + (end - start) / 2);
        if (t > tMax) {
          tMax = t;
        }
      });
      return new Date(tMax);
    },
    priority() {
      return this.dataSelectionMeta.priority;
    },
    ...mapGetters(['dataSelectionItemsMeta', 'dataSelectionMeta']),
    ...mapState(['dataSelection']),
  },
  methods: {
    onClickConfirm() {
      this.$router.push({ name: 'home' });
      this.setModal({
        component: 'ModalRequestsNewConfirmation',
        data: {
          estimatedDeliveryDate: this.estimatedDeliveryDate,
          priority: this.priority,
        },
      });
    },
    ...mapMutations(['setModal']),
  },
};
</script>

<style lang="postcss">
.fc-request-study-confirm {
  & > .btn-confirm {
    height: 40px;
    width: 100%;
  }
}
</style>
