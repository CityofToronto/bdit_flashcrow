<template>
  <v-card class="fc-pane-map-legend" width="200">
    <v-card-text class="default--text">
      <section aria-labelledby="heading_map_settings">
        <h2 class="display-1" id="heading_map_settings">Map settings</h2>

        <v-select
          v-model="internalValue.datesFrom"
          class="mt-4"
          :items="itemsDatesFrom"
          label="Show data from"
          :messages="messagesDatesFrom" />

        <fieldset class="mt-4">
          <legend class="headline">Layers</legend>

          <div
            v-for="layer in layers"
            :key="layer.value"
            class="align-center d-flex my-2">
            <div
              :class="'icon-layer-' + layer.value"
              class="mr-5"></div>
            <div class="body-1 flex-grow-1 mt-1">{{layer.text}}</div>
            <v-tooltip left>
              <template v-slot:activator="{ on }">
                <div v-on="on">
                  <v-checkbox
                    v-model="internalValue.layers[layer.value]"
                    :aria-label="layerLabels[layer.value]"
                    class="mt-0"
                    color="secondary"
                    hide-details
                    off-icon="mdi-eye-off"
                    on-icon="mdi-eye"
                    v-on="on"></v-checkbox>
                </div>
              </template>
              <span>{{layerLabels[layer.value]}}</span>
            </v-tooltip>
          </div>
        </fieldset>
      </section>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';

import TimeFormatters from '@/lib/time/TimeFormatters';
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
      { text: 'Studies', value: 'studies' },
      { text: 'Collisions', value: 'collisions' },
      { text: 'Volume', value: 'volume' },
    ];
    return {
      itemsDatesFrom,
      layers,
    };
  },
  computed: {
    layerLabels() {
      const layerLabels = {};
      this.layers.forEach(({ text, value }) => {
        const layerActive = this.internalValue.layers[value];
        const prefix = layerActive ? 'Hide' : 'Show';
        layerLabels[value] = `${prefix} ${text}`;
      });
      return layerLabels;
    },
    messagesDatesFrom() {
      const { datesFrom } = this.internalValue;
      const start = this.now.minus({ years: datesFrom });
      const end = this.now;
      return TimeFormatters.formatRangeDate({ start, end });
    },
    ...mapState(['now']),
  },
};
</script>

<style lang="scss">
.fc-pane-map-legend {
  & .icon-layer-studies {
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
    background-image: url('/icons/map/volume.png');
    height: 9px;
    margin-top: 2px;
    width: 24px;
  }
}
</style>
