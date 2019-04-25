<template>
<LayoutMain
  class="requests-new-confirm">
    <template v-slot:navSecondary>
      <router-link
        class="link-back"
        :to="linkBackTo">
        View all data
      </router-link>
      <ToggleShowMap />
    </template>
    <template v-slot:panes>
      <PaneDisplay>
        <template v-slot:content>
          <BreadcrumbRequestsNew
            :current-step-completed="true" />
          <h2>Your Count Details</h2>
          <CountDetailsSummary
            v-for="(_, i) in dataSelection.items"
            :key="i"
            :index="i" />
          <NewRequestDetailsSummary />
        </template>
        <template v-slot:actionBar>
          <button
            class="btn-confirm btn-primary"
            @click="onClickConfirm">
            Confirm
          </button>
        </template>
      </PaneDisplay>
      <PaneMap v-if="showMap" />
    </template>
  </LayoutMain>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import BreadcrumbRequestsNew from '@/components/BreadcrumbRequestsNew.vue';
import CountDetailsSummary from '@/components/CountDetailsSummary.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import NewRequestDetailsSummary from '@/components/NewRequestDetailsSummary.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';

export default {
  name: 'RequestsNewConfirm',
  components: {
    BreadcrumbRequestsNew,
    CountDetailsSummary,
    LayoutMain,
    NewRequestDetailsSummary,
    PaneDisplay,
    PaneMap,
    ToggleShowMap,
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
    linkBackTo() {
      const query = this.location === null ? '' : this.location.geoId;
      return { name: 'viewQuery', params: { query } };
    },
    priority() {
      return this.dataSelectionMeta.priority;
    },
    ...mapGetters(['dataSelectionItemsMeta', 'dataSelectionMeta']),
    ...mapState(['dataSelection', 'location', 'showMap']),
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
.requests-new-confirm {
  & .pane-display {
    flex: 2;
  }
  & .pane-map {
    flex: 1;
  }
  footer {
    & > .btn-confirm {
      height: 40px;
      width: 100%;
    }
  }
}
</style>
