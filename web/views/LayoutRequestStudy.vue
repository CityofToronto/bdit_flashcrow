<template>
  <main class="layout-request-study flex-fill flex-container-column">
    <section class="panes flex-fill flex-container-row">
      <div class="pane-display flex-container-column">
        <div class="nav-links flex-container-row px-xl pt-l pb-m text-size-l">
          <router-link
            :to="linkBack.route">
            <i class="fa fa-chevron-left"></i>
            <span> {{linkBack.label}}</span>
          </router-link>
          <div class="flex-fill"></div>
          <router-link
            :to="linkBack.route">
            <span>Cancel </span>
            <i class="fa fa-times"></i>
          </router-link>
        </div>
        <div class="px-xl flex-fill flex-container-column">
          <hr />
          <FcBreadcrumbsRequestStudy :current-step-completed="false" />
          <router-view></router-view>
        </div>
        <div class="action-bottom flex-container-row shadow-3">
          <router-view class="flex-fill" name="actionBottom"></router-view>
        </div>
      </div>
      <PaneMap />
    </section>
  </main>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import FcBreadcrumbsRequestStudy from '@/web/components/FcBreadcrumbsRequestStudy.vue';
import PaneMap from '@/web/components/PaneMap.vue';

export default {
  name: 'LayoutRequestStudy',
  components: {
    FcBreadcrumbsRequestStudy,
    PaneMap,
  },
  computed: {
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    linkBack() {
      if (this.studyRequest.id !== undefined) {
        // coming from edit flow
        const { id } = this.studyRequest;
        const route = {
          name: 'requestStudyView',
          params: { id },
        };
        if (this.isSupervisor) {
          route.query = { isSupervisor: true };
        }
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
  & .pane-display {
    flex: 2;

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

  & .pane-map {
    flex: 1;
  }
}
</style>
