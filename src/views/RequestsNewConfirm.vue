<template>
<LayoutMain
  class="requests-new-confirm">
    <template v-slot:navSecondary>
      <router-link
        class="link-back"
        :to="{name: 'viewQuery'}">
        View all data
      </router-link>
      <BreadcrumbRequestsNew />
      <ToggleShowMap />
    </template>
    <template v-slot:panes>
      <PaneDisplay>
        <template v-slot:content>
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
import { mapGetters, mapState } from 'vuex';

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
    ...mapGetters(['dataSelectionItemsMeta', 'dataSelectionMeta']),
    ...mapState(['dataSelection', 'showMap']),
  },
  methods: {
    onClickConfirm() {
      this.$router.push({ name: 'home' });
    },
  },
};
</script>

<style lang="postcss">
.requests-new-confirm {
  & .breadcrumb-steps {
    flex: 1;
    margin: 0 calc(var(--sp) * 8);
  }
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
