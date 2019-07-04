<template>
  <div class="pane-map-popup">
  Location: "{{description}}" <br> Type: "{{centrelineDesc}}"
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

export default {
  name: 'PaneMapPopup',
  props: {
    lng: Number,
    lat: Number,
    description: String,
    centrelineDesc: String,
    centrelineType: Number,
    centrelineId: Number,
  },
  inject: {
    map: {
      default: null,
    },
  },
  mounted() {
    this.popup = new mapboxgl.Popup();
    this.popup.setLngLat([this.lng, this.lat]);
    this.popup.setDOMContent(this.$el);
    this.popup.addTo(this.map);
  },
  methods: {
    onViewData() {
      if (this.description === null) {
        return;
      }

      // open the view data window
      const routerParameters = {
        centrelineId: this.centrelineId,
        centrelineType: this.centrelineType,
      };
      this.$router.push({
        name: 'viewDataAtLocation',
        params: routerParameters,
      });

      // update location
      const elementInfo = {
        centrelineId: this.centrelineId,
        centrelineType: this.centrelineType,
        description: this.description,
        lng: this.lng,
        lat: this.lat,
      };
      this.setLocation(elementInfo);
    },
    ...mapMutations(['setLocation']),
  },
  beforeDestroy() {
    if (this.map) {
      this.popup.remove();
    }
  },
};
</script>

<style lang="postcss">
.pane-map-popup {
  background-color: white;
}
</style>
