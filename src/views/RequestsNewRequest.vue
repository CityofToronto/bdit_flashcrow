<template>
<LayoutMain
  class="requests-new-request">
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
            class="btn-request-data btn-primary"
            @click="onClickRequestData">
            Request Data ({{countsRequested.length}})
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
        (c) => {
          if (c.date === null) {
            return -Infinity;
          }
          return c.date.valueOf();
        },
      );
      if (mostRecentCountOfType.requestNew) {
        /* eslint-disable no-alert */
        window.alert('already selected');
      } else {
        mostRecentCountOfType.requestNew = true;
      }
      this.$refs.requestAnother.clearSelection();
      this.requestAnother = null;
    },
  },
  methods: {
    onClickRequestData() {
      if (this.countsRequested.length === 0) {
        /* eslint-disable no-alert */
        window.alert('Nothing selected!');
      } else {
        this.$router.push({ name: 'requestsNewSchedule' });
      }
    },
  },
};
</script>

<style lang="postcss">
.requests-new-request {
  & .breadcrumb-steps {
    flex-grow: 1;
    margin: 0 calc(var(--sp) * 8);
  }
  & .pane-display {
    flex-grow: 2;
  }
  & .pane-map {
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
