<template>
  <v-navigation-drawer
    v-model="internalValue"
    absolute
    class="fc-global-filter-drawer"
    right
    temporary
    :width="280">
  </v-navigation-drawer>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcGlobalFilterDrawer',
  mixins: [FcMixinVModelProxy(Boolean)],
};
</script>

<style lang="scss">
.fc-global-filter-drawer.v-navigation-drawer--temporary {
  z-index: 400;
}
</style>
