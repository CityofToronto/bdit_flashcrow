<template>
  <v-card class="fc-map-legend" width="250">
    <v-card-text class="default--text pa-0">
      <fieldset>
        <legend class="headline px-4 py-3">Legend</legend>

        <v-divider></v-divider>

        <template v-for="(layerItem, i) in layerItems">
          <v-divider
            v-if="layerItem === null"
            :key="i"
            class="ml-4"></v-divider>
          <component
            v-else
            v-model="internalValue[layerItem.value]"
            :key="layerItem.value"
            :is="'FcLegendRow' + layerItem.suffix"
            class="mx-4 mt-2 mb-3" />
        </template>
      </fieldset>

      <v-divider></v-divider>

      <div class="text-center py-1">
        <FcButton
          type="tertiary"
          @click="showMore = !showMore">
          <span v-if="showMore">Less</span>
          <span v-else>More</span>
        </FcButton>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcLegendRowCollisions from '@/web/components/geo/legend/FcLegendRowCollisions.vue';
import FcLegendRowHospitals from '@/web/components/geo/legend/FcLegendRowHospitals.vue';
import FcLegendRowSchools from '@/web/components/geo/legend/FcLegendRowSchools.vue';
import FcLegendRowStudies from '@/web/components/geo/legend/FcLegendRowStudies.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcPaneMapLegend',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcLegendRowCollisions,
    FcLegendRowHospitals,
    FcLegendRowSchools,
    FcLegendRowStudies,
    FcTooltip,
  },
  data() {
    const layerItemsLess = [
      { suffix: 'Collisions', value: 'collisions' },
      null,
      { suffix: 'Studies', value: 'studies' },
    ];
    const layerItemsMore = [
      null,
      { suffix: 'Schools', value: 'schools' },
      null,
      { suffix: 'Hospitals', value: 'hospitals' },
    ];
    return {
      showMore: false,
      layerItemsLess,
      layerItemsMore,
    };
  },
  computed: {
    layerItems() {
      if (this.showMore) {
        return [...this.layerItemsLess, ...this.layerItemsMore];
      }
      return this.layerItemsLess;
    },
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
.fc-map-legend {
  & .fc-legend-icon {
    height: 24px;
    position: relative;
    width: 24px;
  }
}
</style>