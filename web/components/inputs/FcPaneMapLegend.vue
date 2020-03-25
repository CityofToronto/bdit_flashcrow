<template>
  <v-card class="fc-pane-map-legend" width="200">
    <v-card-text>
      <h2 class="headline">Viewing data from</h2>
      <v-select
        v-model="internalValue.datesFrom"
        hide-details
        :items="itemsDatesFrom"></v-select>
      <h2 class="headline mt-6">Legend</h2>
      <div
        v-for="layer in layers"
        :key="layer.value"
        class="align-center d-flex my-3">
        <div
          :class="'icon-layer-' + layer.value"
          class="mr-5"></div>
        <div class="body-1 flex-grow-1 mt-1">{{layer.text}}</div>
        <v-tooltip left>
          <template v-slot:activator="{ on }">
            <v-checkbox
              v-model="internalValue.layers[layer.value]"
              class="mt-0"
              color="secondary"
              hide-details
              off-icon="mdi-eye-off"
              on-icon="mdi-eye"
              v-on="on"></v-checkbox>
          </template>
          <span>
            <span v-if="internalValue.layers[layer.value]">
              Hide {{layer.text}}
            </span>
            <span v-else>
              Show {{layer.text}}
            </span>
          </span>
        </v-tooltip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcPaneMapLegend',
  mixins: [FcMixinVModelProxy(Object)],
  data() {
    const itemsDatesFrom = [
      { text: 'Last year', value: 1 },
      { text: 'Last 3 years', value: 3 },
      { text: 'Last 5 years', value: 5 },
      { text: 'Last 10 years', value: 10 },
    ];
    const layers = [
      { text: 'Studies', value: 'counts' },
      { text: 'Collisions', value: 'collisions' },
      { text: 'Volume', value: 'volume' },
    ];
    return {
      itemsDatesFrom,
      layers,
    };
  },
};
</script>

<style lang="scss">
.fc-pane-map-legend {
  & .icon-layer-counts {
    background: linear-gradient(180deg, #9f92f3 0%, #5f48ef 100%);
    border: 1px solid #fff;
    border-radius: 12px;
    height: 24px;
    width: 24px;
  }
  & .icon-layer-collisions {
    background: #ef4848;
    border: 1px solid #733;
    border-radius: 12px;
    height: 24px;
    width: 24px;
  }
  & .icon-layer-volume {
    background:
      linear-gradient(
        273.37deg,
        rgba(252, 92, 101, 0.8) 0.88%,
        rgba(254, 211, 48, 0.8) 51.62%,
        rgba(38, 222, 129, 0.8) 99.28%
      );
    border-radius: 20px;
    height: 7px;
    width: 24px;
  }
}
</style>
