<template>
  <v-navigation-drawer
    app
    aria-label="Main MOVE navigation"
    class="fc-navigation-drawer"
    clipped
    mini-variant
    permanent>
    <FcDashboardNav />
    <template v-slot:append>
      <FcDashboardNavUser />
    </template>
  </v-navigation-drawer>
</template>

<script>
import FcDashboardNav from '@/web/components/nav/FcDashboardNav.vue';
import FcDashboardNavUser from '@/web/components/nav/FcDashboardNavUser.vue';

export default {
  name: 'FcNavbar',
  components: {
    FcDashboardNav,
    FcDashboardNavUser,
  },
};
</script>
