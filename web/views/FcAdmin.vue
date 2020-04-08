<template>
  <section class="fc-admin d-flex flex-column fill-height">
    <header class="flex-grow-0 flex-shrink-0">
      <v-tabs>
        <v-tab :to="{ name: 'adminPermissions' }">
          Permissions
        </v-tab>
        <v-tab :to="{ name: 'adminMetrics' }">
          Metrics
        </v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <div class="px-5">
        <h1 class="display-3 mt-5">{{title}}</h1>
      </div>
    </header>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto px-5">
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
      if (name === 'adminMetrics') {
        return 'MOVE Metrics';
      }
      if (name === 'adminPermissions') {
        return 'MOVE Permissions';
      }
      return 'MOVE Admin Console';
    },
  },
};
</script>

<style lang="scss">
.fc-admin {
  max-height: 100vh;
  width: 100%;
}
</style>
