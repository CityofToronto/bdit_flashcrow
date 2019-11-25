<template>
  <main class="layout-request-study flex-fill flex-container-column">
    <TdsTopBar class="nav-links text-size-l">
      <template v-slot:left>
        <router-link
          :to="linkBack.route">
          <i class="fa fa-chevron-left"></i>
          <span> {{linkBack.label}}</span>
        </router-link>
      </template>
      <template v-slot:right>
        <router-link
          :to="linkBack.route">
          <span>Cancel </span>
          <i class="fa fa-times"></i>
        </router-link>
      </template>
    </TdsTopBar>
    <div class="px-xl flex-fill flex-container-column">
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

import FcBreadcrumbsRequestStudy from '@/web/components/FcBreadcrumbsRequestStudy.vue';
import TdsTopBar from '@/web/components/tds/TdsTopBar.vue';

export default {
  name: 'LayoutRequestStudy',
  components: {
    FcBreadcrumbsRequestStudy,
    TdsTopBar,
  },
  computed: {
    linkBack() {
      if (this.studyRequest.id !== undefined) {
        // coming from edit flow
        const { id } = this.studyRequest;
        const route = {
          name: 'requestStudyView',
          params: { id },
        };
        const label = `Back to Request #${id}`;
        return { route, label };
      }
      // coming from view flow
      const { centrelineId, centrelineType, description } = this.location;
      const route = {
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      };
      const label = `Back to ${description}`;
      return { route, label };
    },
    ...mapState(['location', 'studyRequest']),
  },
  methods: {
    ...mapMutations(['setModal']),
  },
};
</script>

<style lang="postcss">
.layout-request-study {
  & > .nav-links {
    padding: var(--space-l) var(--space-xl) var(--space-s) var(--space-xl);
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
