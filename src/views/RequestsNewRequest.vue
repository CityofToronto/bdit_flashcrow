<template>
<LayoutMain
  class="requests-new-request">
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
            :current-step-completed="!$v.$invalid" />
          <CountsRequestedTable />
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
import { mapGetters, mapState } from 'vuex';

import BreadcrumbRequestsNew from '@/components/BreadcrumbRequestsNew.vue';
import CountsRequestedTable from '@/components/CountsRequestedTable.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';

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
  computed: {
    linkBackTo() {
      const query = this.location === null ? '' : this.location.geoId;
      return { name: 'viewQuery', params: { query } };
    },
    ...mapGetters([
      'dataSelectionContains',
      'dataSelectionEmpty',
      'dataSelectionItems',
      'dataSelectionLength',
    ]),
    ...mapState(['counts', 'location', 'showMap']),
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
  },
};
</script>

<style lang="postcss">
.requests-new-request {
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
