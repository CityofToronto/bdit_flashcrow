<template>
  <v-navigation-drawer
    app
    class="fc-navigation-drawer"
    mini-variant
    permanent
    tag="div">
    <template v-slot:prepend>
      <FcDashboardNavBrand />
    </template>
    <FcDashboardNav />
    <template v-slot:append>
      <FcDashboardNavUser />
    </template>
  </v-navigation-drawer>
</template>

<script>
import FcDashboardNav from '@/web/components/nav/FcDashboardNav.vue';
import FcDashboardNavBrand from '@/web/components/nav/FcDashboardNavBrand.vue';
import FcDashboardNavUser from '@/web/components/nav/FcDashboardNavUser.vue';

export default {
  name: 'FcNavbar',
  components: {
    FcDashboardNav,
    FcDashboardNavBrand,
    FcDashboardNavUser,
  },
};
</script>
