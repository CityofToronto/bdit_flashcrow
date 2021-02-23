<template>
  <div class="fc-summary-poi-chip">
    <FcTooltip bottom>
      <template v-slot:activator="{ on }">
        <v-chip
          v-on="on"
          :color="color + ' lighten-4'"
          tag="dt"
          :text-color="color + ' darken-4'">
          <v-avatar left>
            <v-icon>{{icon}}</v-icon>
          </v-avatar>
          {{text}}
        </v-chip>
      </template>
      <span>{{poiDistance}} m</span>
    </FcTooltip>
    <dd class="sr-only">{{poiDistance}} m</dd>
  </div>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';

export default {
  name: 'FcSummaryPoiChip',
  components: {
    FcTooltip,
  },
  props: {
    color: String,
    icon: String,
    poi: Object,
    text: String,
  },
  computed: {
    poiDistance() {
      return Math.round(this.poi.geom_dist);
    },
  },
};
</script>

<style lang="scss">
.fc-summary-poi-chip {
  display: inline-block;
}
</style>
