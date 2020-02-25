<template>
  <v-tooltip right>
    <template v-slot:activator="{ on }">
      <div
        class="pa-2 pt-3"
        v-on="on">
        <h1 class="sr-only">MOVE</h1>
        <v-img
          alt="MOVE Logo"
          src="/logo_square.png"></v-img>
      </div>
    </template>
    <span>MOVE</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'FcDashboardNavBrand',
};
</script>
