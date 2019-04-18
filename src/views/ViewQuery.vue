<template>
  <LayoutMain
    class="view-query">
    <template v-slot:navSecondary>
      <FilterDate />
      <FilterCountTypes />
      <ToggleShowMap />
    </template>
    <template v-slot:panes>
      <PaneDisplay>
        <template v-slot:content>
          <CountsTable :counts="counts" />
        </template>
        <template v-slot:actionBar>
          <div
            class="selected-count-wrapper text-center"
            :class="{'some-selected': !dataSelectionEmpty}">
            <div class="selected-count">{{dataSelectionLength}}</div>
            <h3>Selected</h3>
          </div>
          <div class="print-wrapper">
            <button :disabled="dataSelectionEmpty">
              <i class="fa fa-print"></i> Print All
            </button>
          </div>
          <div class="download-wrapper">
            <button :disabled="dataSelectionEmpty">
              <i class="fa fa-print"></i> Download All
            </button>
          </div>
          <div class="start-request-wrapper text-right">
            <button
              class="btn-primary"
              @click="onClickStartRequest"
              :disabled="dataSelectionEmpty">
              Start Request
            </button>
          </div>
        </template>
      </PaneDisplay>
      <PaneMap v-if="showMap" />
    </template>
  </LayoutMain>
</template>

<script>
/* eslint-disable no-alert */
import { mapGetters, mapMutations, mapState } from 'vuex';

import CountsTable from '@/components/CountsTable.vue';
import FilterCountTypes from '@/components/FilterCountTypes.vue';
import FilterDate from '@/components/FilterDate.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';

export default {
  name: 'ViewQuery',
  components: {
    CountsTable,
    FilterCountTypes,
    FilterDate,
    LayoutMain,
    PaneDisplay,
    PaneMap,
    ToggleShowMap,
  },
  computed: {
    ...mapGetters(['dataSelectionEmpty', 'dataSelectionLength']),
    ...mapState(['counts', 'showMap']),
  },
  methods: {
    onClickStartRequest() {
      if (this.dataSelectionEmpty) {
        window.alert('Nothing selected!');
      } else {
        this.$router.push({ name: 'requestsNewRequest' });
        this.setShowMap(false);
      }
    },
    ...mapMutations(['setShowMap']),
  },
};
</script>

<style lang="postcss">
.view-query {
  & .pane-display {
    flex-grow: 2;
    footer {
      & > .selected-count-wrapper,
      & > .print-wrapper,
      & > .download-wrapper {
        flex-grow: 1;
        & > button {
          height: 100%;
        }
      }
      & > .start-request-wrapper {
        flex-grow: 3;
        & > button {
          height: 100%;
        }
      }
      & > .selected-count-wrapper {
        color: var(--outline-grey-focus);
        & > .selected-count {
          background-color: var(--off-white);
          border: 1px solid var(--outline-grey-focus);
          border-radius: 16px;
          font-size: var(--text-xxl);
          height: 32px;
          line-height: 30px;
          margin: auto;
          width: 32px;
        }
        &.some-selected {
          color: var(--green);
          & > .selected-count {
            background-color: var(--light-green);
            border-color: var(--green);
          }
        }
      }
    }
  }
  & .pane-map {
    flex-grow: 1;
  }
}
</style>
