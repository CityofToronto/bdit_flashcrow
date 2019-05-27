<template>
  <main class="layout-request-study flex-fill flex-container-column">
    <TdsTopBar class="nav-links text-size-l">
      <template v-slot:left>
        <router-link
          :to="linkBackToData">
          <i class="fa fa-chevron-left"></i>
          <span> Back To Data</span>
        </router-link>
      </template>
      <template v-slot:right>
        <router-link
          :to="{ name: 'home' }">
          <span>Cancel </span>
          <i class="fa fa-times"></i>
        </router-link>
      </template>
    </TdsTopBar>
    <div class="px-xl flex-fill">
      <hr />
      <FcBreadcrumbsRequestStudy :current-step-completed="false" />
      <hr />
      <router-view></router-view>
    </div>
    <div class="action-bottom flex-container-row shadow-3">
      <router-view class="flex-fill" name="actionBottom"></router-view>
    </div>
  </main>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import FcBreadcrumbsRequestStudy from '@/components/FcBreadcrumbsRequestStudy.vue';
import TdsTopBar from '@/components/tds/TdsTopBar.vue';

export default {
  name: 'LayoutRequestStudy',
  components: {
    FcBreadcrumbsRequestStudy,
    TdsTopBar,
  },
  computed: {
    linkBackToData() {
      const { keyString } = this.location;
      return {
        name: 'viewDataAtLocation',
        params: { keyString },
      };
    },
    ...mapState(['location']),
  },
  beforeRouteLeave(to, from, next) {
    this.setModal({
      component: 'TdsConfirmDialog',
      data: {
        title: 'Cancel Request?',
        prompt: 'If you cancel your request now, your selection will be lost.',
        textCancel: 'No, go back',
        textOk: 'Yes, cancel',
        action: next,
        actionCancel: () => {
          next(false);
        },
      },
    });
  },
  methods: {
    ...mapMutations(['setModal']),
  },
};
</script>

<style lang="postcss">
.layout-request-study {
  & > .nav-links {
    text-transform: uppercase;
    & > a {
      text-decoration: none;
    }
  }
  & > .action-bottom {
    padding: var(--space-m) var(--space-xl);
  }
}
</style>
