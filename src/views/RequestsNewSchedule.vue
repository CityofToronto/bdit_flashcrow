<template>
<LayoutMain
  class="requests-new-schedule">
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
          <CountDetails
            v-for="(_, i) in dataSelection.items"
            :key="i"
            :index="i" />
          <NewRequestDetails />
        </template>
        <template v-slot:actionBar>
          <button
            class="btn-continue btn-primary"
            @click="onClickContinue">
            Continue
          </button>
        </template>
      </PaneDisplay>
      <PaneMap v-if="showMap" />
    </template>
  </LayoutMain>
</template>

<script>
import { mapState } from 'vuex';

import BreadcrumbRequestsNew from '@/components/BreadcrumbRequestsNew.vue';
import CountDetails from '@/components/CountDetails.vue';
import LayoutMain from '@/components/LayoutMain.vue';
import NewRequestDetails from '@/components/NewRequestDetails.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';

export default {
  name: 'RequestsNewRequest',
  components: {
    BreadcrumbRequestsNew,
    CountDetails,
    LayoutMain,
    NewRequestDetails,
    PaneDisplay,
    PaneMap,
    ToggleShowMap,
  },
  computed: {
    ...mapState(['dataSelection', 'showMap']),
  },
  methods: {
    onClickContinue() {
      // TODO: implement this
      this.$router.push({ name: 'requestsNewConfirm' });
    },
  },
};
</script>

<style lang="postcss">
.requests-new-schedule {
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
    & > .btn-continue {
      height: 40px;
      width: 100%;
    }
  }
}
</style>
