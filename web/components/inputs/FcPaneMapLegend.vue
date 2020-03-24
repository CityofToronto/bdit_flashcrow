<template>
  <v-card class="fc-pane-map-legend" width="200">
    <v-card-title>
      <h2 class="headline">Viewing data from</h2>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <h2 class="headline">Legend</h2>
    </v-card-text>
  </v-card>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcPaneMapLegend',
  mixins: [FcMixinVModelProxy(Object)],
};
</script>

<style lang="postcss">
.fc-pane-map-legend.v-card {
  & h2 {
    color: var(--v-default-base);
  }
}
</style>
