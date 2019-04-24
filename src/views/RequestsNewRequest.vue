<template>
<LayoutMain
  class="requests-new-request">
    <template v-slot:navSecondary>
      <router-link
        class="link-back"
        :to="linkBackTo">
        View all data
      </router-link>
      <BreadcrumbRequestsNew />
      <ToggleShowMap />
    </template>
    <template v-slot:panes>
      <PaneDisplay>
        <template v-slot:content>
          <CountsRequestedTable />
          <div v-if="optionsCountTypes.length > 0">
            <v-select
              ref="requestAnother"
              v-model="requestAnother"
              class="form-select request-another"
              :options="optionsCountTypes"
              placeholder="Request another study" />
          </div>
          <div class="validation-error" v-if="!$v.dataSelectionEmpty.notEmpty">
            To request data, first select one or more count types to request.
          </div>
        </template>
        <template v-slot:actionBar>
          <button
            class="btn-request-data btn-primary"
            @click="onClickRequestData">
            Request Data ({{dataSelectionLength}})
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
      requestAnother: null,
    };
  },
  computed: {
    linkBackTo() {
      const query = this.location === null ? '' : this.location.geoId;
      return { name: 'viewQuery', params: { query } };
    },
    optionsCountTypes() {
      return Constants.COUNT_TYPES.filter(({ value }) => {
        const i = this.dataSelectionItems.findIndex(c => c.type.value === value);
        return i === -1;
      });
    },
    ...mapGetters([
      'dataSelectionContains',
      'dataSelectionEmpty',
      'dataSelectionItems',
      'dataSelectionLength',
    ]),
    ...mapState(['counts', 'location', 'showMap']),
  },
  watch: {
    requestAnother() {
      if (this.requestAnother === null) {
        return;
      }
      const count = ArrayUtils.getMaxBy(
        this.counts.filter(c => c.type.value === this.requestAnother.value),
        (c) => {
          if (c.date === null) {
            return -Infinity;
          }
          return c.date.valueOf();
        },
      );
      if (!this.dataSelectionContains(count)) {
        this.addToDataSelection(count);
      }
      this.$refs.requestAnother.clearSelection();
      this.requestAnother = null;
    },
  },
  validations: {
    dataSelectionEmpty: {
      notEmpty: value => !value,
    },
  },
  methods: {
    onClickRequestData() {
      if (this.$v.$invalid) {
        /* eslint-disable no-alert */
        window.alert('The form contains one or more errors.');
      } else {
        this.$router.push({ name: 'requestsNewSchedule' });
      }
    },
    ...mapMutations(['addToDataSelection']),
  },
};
</script>

<style lang="postcss">
.requests-new-request {
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
    & > .btn-request-data {
      height: 40px;
      width: 100%;
    }
  }
}
</style>
