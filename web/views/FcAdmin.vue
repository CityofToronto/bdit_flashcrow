<template>
  <section class="fc-admin d-flex flex-column fill-height">
    <nav class="flex-grow-0 flex-shrink-0">
      <v-tabs>
        <v-tab :to="{ name: 'adminPermissions' }">
          Permissions
        </v-tab>
        <v-tab :to="{ name: 'adminMetrics' }">
          Metrics
        </v-tab>
        <v-tab :to="{ name: 'adminUtilities' }">
          Utilities
        </v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <div class="px-5">
        <h2 class="display-3 mt-5">{{title}}</h2>
      </div>
    </nav>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto px-0">
      <router-view></router-view>
    </section>
  </section>
</template>

<script>
export default {
  name: 'FcAdmin',
  computed: {
    title() {
      const { name } = this.$route;
      let title;
      switch (name) {
        case 'adminMetrics':
          title = 'Metrics';
          break;
        case 'adminPermissions':
          title = 'User Permissions';
          break;
        case 'adminUtilities':
          title = 'Utilities';
          break;
        default:
          title = 'MOVE Admin Console';
      }
      return title;
    },
  },
};
</script>

<style lang="scss">
.fc-admin {
  max-height: var(--full-height);
  width: 100%;
  background-color: var(--v-shading-base);
}
</style>
