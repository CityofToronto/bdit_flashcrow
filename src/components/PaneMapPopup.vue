<template>
  <div class="pane-map-popup">
  Location: "{{descriptionFormatted}}" <br> Type: "{{layerId}}"
  <button
    class="font-size-l"
    @click="onViewData">
    View Data
    </button>
  </div>
</template>

<script>
import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import { mapMutations } from 'vuex';

import { CentrelineType } from '@/lib/Constants';
import StringFormatters from '@/lib/StringFormatters';
import { getLineStringMidpoint } from '@/lib/geo/GeometryUtils';

export default {
  name: 'PaneMapPopup',
  props: {
    feature: Object,
  },
  inject: {
    map: {
      default: null,
    },
  },
  computed: {
    centrelineId() {
      if (this.layerId === 'centreline' || this.layerId === 'intersections') {
        return this.feature.properties.geo_id;
      }
      return this.feature.properties.centrelineId;
    },
    centrelineType() {
      if (this.layerId === 'centreline') {
        return CentrelineType.SEGMENT;
      }
      if (this.layerId === 'intersections') {
        return CentrelineType.INTERSECTION;
      }
      return this.feature.properties.centrelineType;
    },
    coordinates() {
      const { coordinates } = this.feature.geometry;
      if (this.layerId === 'centreline') {
        return getLineStringMidpoint(coordinates);
      }
      return coordinates;
    },
    description() {
      if (this.layerId === 'centreline') {
        return this.feature.properties.lf_name;
      }
      if (this.layerId === 'intersections') {
        return this.feature.properties.intersec5;
      }
      return this.feature.properties.locationdesc;
    },
    descriptionFormatted() {
      return StringFormatters.formatCountLocationDescription(this.description);
    },
    layerId() {
      return this.feature.layer.id;
    },
  },
  mounted() {
    this.popup = new mapboxgl.Popup()
      .setLngLat(this.coordinates)
      .setDOMContent(this.$el)
      .addTo(this.map);
  },
  beforeDestroy() {
    if (this.map) {
      this.popup.remove();
    }
  },
  methods: {
    onViewData() {
      // update location
      const [lng, lat] = this.coordinates;
      const elementInfo = {
        centrelineId: this.centrelineId,
        centrelineType: this.centrelineType,
        description: this.description,
        lng,
        lat,
      };
      this.setLocation(elementInfo);

      // open the view data window
      const routerParameters = {
        centrelineId: this.centrelineId,
        centrelineType: this.centrelineType,
      };
      this.$router.push({
        name: 'viewDataAtLocation',
        params: routerParameters,
      });
    },
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="postcss">
.pane-map-popup {
  background-color: white;
}
</style>
