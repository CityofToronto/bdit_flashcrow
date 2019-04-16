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
          <h3>Your Count Details</h3>
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
import LayoutMain from '@/components/LayoutMain.vue';
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import ToggleShowMap from '@/components/ToggleShowMap.vue';

export default {
  name: 'RequestsNewRequest',
  components: {
    BreadcrumbRequestsNew,
    LayoutMain,
    PaneDisplay,
    PaneMap,
    ToggleShowMap,
  },
  computed: {
    ...mapState(['showMap']),
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
    & > .btn-continue {
      height: 40px;
      width: 100%;
    }
  }
}
</style>
