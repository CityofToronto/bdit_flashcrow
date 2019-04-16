<template>
<LayoutMain
  class="requests-new-request"
  :class="{'show-map': showMap}">
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
          <CountsRequestedTable
            :counts-requested="countsRequested" />
          <div>
            <v-select
              ref="requestAnother"
              v-model="requestAnother"
              class="form-select request-another"
              :options="optionsCountTypes"
              placeholder="Request another study" />
          </div>
        </template>
        <template v-slot:actionBar>
          <button
            class="btn-request-data btn-primary">
            Start Request ({{countsRequested.length}})
          </button>
        </template>
      </PaneDisplay>
      <PaneMap />
    </template>
  </LayoutMain>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import BreadcrumbRequestsNew from '@/components/BreadcrumbRequestsNew.vue';
import CountsRequestedTable from '@/components/CountsRequestedTable.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';
import ArrayUtils from '@/lib/ArrayUtils';
import Constants from '@/lib/Constants';

export default {
  name: 'RequestsNewRequest',
  components: {
    BreadcrumbRequestsNew,
    CountsRequestedTable,
    LayoutMain,
    PaneDisplay,
    PaneMap,
    ToggleShowMap,
  },
  data() {
    return {
      optionsCountTypes: Constants.COUNT_TYPES,
      requestAnother: null,
    };
  },
  computed: {
    ...mapGetters(['countsRequested']),
    ...mapState(['counts', 'showMap']),
  },
  watch: {
    requestAnother() {
      if (this.requestAnother === null) {
        return;
      }
      const mostRecentCountOfType = ArrayUtils.getMaxBy(
        this.counts.filter(c => c.type.value === this.requestAnother.value),
        c => c.date.valueOf(),
      );
      if (mostRecentCountOfType.requestNew) {
        // TODO: handle this case
        window.alert('already selected');
      } else {
        mostRecentCountOfType.requestNew = true;
      }
      this.$refs.requestAnother.clearSelection();
      this.requestAnother = null;
    },
  },
};
</script>

<style lang="postcss">
.requests-new-request {
  .link-back {
    flex-grow: 1;
  }
  & .pane-display {
    flex-grow: 2;
  }
  & .pane-map {
    display: none;
  }
  &.show-map .pane-map {
    display: block;
    flex-grow: 1;
  }
  footer {
    & > .btn-request-data {
      height: 40px;
      width: 100%;
    }
  }
}
</style>
