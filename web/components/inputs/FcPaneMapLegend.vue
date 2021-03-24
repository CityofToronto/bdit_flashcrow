<template>
  <v-card class="fc-pane-map-legend" width="200">
    <v-card-text class="default--text">
      <fieldset>
        <legend class="headline">Legend</legend>

        <div
          v-for="layerItem in layerItems"
          :key="layerItem.value"
          class="align-center d-flex my-2">
          <component
            :is="'FcLegendIcon' + layerItem.suffix"
            class="mr-4" />
          <div class="body-1 flex-grow-1 mt-1">{{layerItem.text}}</div>
          <FcTooltip left>
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-checkbox
                  v-model="internalValue[layerItem.value]"
                  :aria-label="layerLabels[layerItem.value]"
                  class="mt-0"
                  color="secondary"
                  hide-details
                  off-icon="mdi-eye-off"
                  on-icon="mdi-eye"
                  v-on="on"></v-checkbox>
              </div>
            </template>
            <span>{{layerLabels[layerItem.value]}}</span>
          </FcTooltip>
        </div>
      </fieldset>
    </v-card-text>
  </v-card>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcLegendIconCollisions from '@/web/components/legend/FcLegendIconCollisions.vue';
import FcLegendIconStudies from '@/web/components/legend/FcLegendIconStudies.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcPaneMapLegend',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcLegendIconCollisions,
    FcLegendIconStudies,
    FcTooltip,
  },
  data() {
    const layerItems = [
      { suffix: 'Studies', text: 'Studies', value: 'studies' },
      { suffix: 'Collisions', text: 'Collisions', value: 'collisions' },
    ];
    return {
      layerItems,
    };
  },
  computed: {
    layerLabels() {
      const layerLabels = {};
      this.layerItems.forEach(({ text, value }) => {
        const layerActive = this.internalValue[value];
        const prefix = layerActive ? 'Hide' : 'Show';
        layerLabels[value] = `${prefix} ${text}`;
      });
      return layerLabels;
    },
  },
};
</script>
