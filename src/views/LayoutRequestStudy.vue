<template>
  <main class="layout-request-study flex-fill flex-container-column">
    <TdsTopBar class="text-size-l">
      <template v-slot:left>
        <router-link :to="linkBackToData">
          <i class="fa fa-chevron-left"></i>
          <span> Back To Data</span>
        </router-link>
      </template>
      <template v-slot:right>
        <router-link :to="{ name: 'home' }">
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
  </main>
</template>

<script>
import { mapState } from 'vuex';

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
};
</script>

<style lang="postcss">
.layout-request-study {
}
</style>
