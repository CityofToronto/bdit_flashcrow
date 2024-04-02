<template>
  <v-card class="fc-map-legend" :class="{ shrink: isHidden }">
    <v-card-text class="default--text pa-0">
      <fieldset>
        <legend class="headline px-4 py-3 d-flex justify-content-between">
          <div>Legend</div>
          <v-icon v-if="!isHidden" @click="toggleLegend">mdi-chevron-down</v-icon>
          <v-icon v-else @click="toggleLegend">mdi-chevron-up</v-icon>
        </legend>
        <v-divider></v-divider>

        <div v-if="!isHidden" >
          <template v-for="(layerItem, i) in layerItems" >
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
        </div>
      </fieldset>

      <div v-if="!isHidden">
        <v-divider></v-divider>

        <div class="text-center py-1">
          <FcButton
            type="tertiary"
            @click="showMore = !showMore">
            <span v-if="showMore">
              <v-icon>mdi-menu-up</v-icon>
              Less
            </span>
            <span v-else>
              More
            </span>
          </FcButton>
        </div>
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
  name: 'FcMapLegend',
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
      isHidden: false,
      showMore: false,
      layerItemsLess,
      layerItemsMore,
    };
  },
  methods: {
    toggleLegend() {
      this.isHidden = !this.isHidden;
    },
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
  width: 250px;
  display: block;
  & .fc-legend-icon {
    height: 24px;
    position: relative;
    width: 24px;
  }
  & .headline {
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }
}
.shrink {
  opacity: 0.9;
}

@media only screen and (max-width: 600px) {
  .fc-map-legend {
    display: none;
  }
}
// hide when screen is too-short, too
@media only screen and (max-height: 450px) {
  .fc-map-legend {
    display: none;
  }
}
</style>
