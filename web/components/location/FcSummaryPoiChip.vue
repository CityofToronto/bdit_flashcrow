<template>
  <div class="fc-summary-poi-chip">
    <v-tooltip bottom>
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
      <span>{{ariaLabel}}</span>
    </v-tooltip>
    <dd class="sr-only">{{ariaLabel}}</dd>
  </div>
</template>

<script>
export default {
  name: 'FcSummaryPoiChip',
  components: {},
  props: {
    ariaLabel: String,
    color: String,
    icon: String,
    text: String,
  },
};
</script>

<style lang="scss">
.fc-summary-poi-chip {
  display: inline-block;
  margin-top: 5px;
}
</style>
