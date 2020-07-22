<template>
  <v-tooltip bottom>
    <template v-slot:activator="{ on }">
      <v-chip
        v-on="on"
        class="mr-2"
        :color="color + ' lighten-4'"
        :text-color="color + ' darken-4'">
        <v-avatar left>
          <v-icon>{{icon}}</v-icon>
        </v-avatar>
        {{text}}
      </v-chip>
    </template>
    <span>{{poiDistance}} m</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'FcSummaryPoiChip',
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
