<template>
  <v-card class="fc-pane-map-legend" width="200">
    <v-card-text class="default--text">
      <fieldset>
        <legend class="headline">Legend</legend>

        <div
          v-for="layerItem in layerItems"
          :key="layerItem.value"
          class="align-center d-flex my-2">
          <div
            :class="'icon-layer-' + layerItem.value"
            class="mr-5"></div>
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
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcPaneMapLegend',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcTooltip,
  },
  data() {
    const layerItems = [
      { text: 'Studies', value: 'studies' },
      { text: 'Collisions', value: 'collisions' },
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
