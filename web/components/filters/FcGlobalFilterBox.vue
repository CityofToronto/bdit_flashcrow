<template>
  <v-card class="fc-filter-box">
    <v-card-text class="pl-3 pa-1">
      <FcGlobalFilters :readonly="readonly" />
    </v-card-text>
  </v-card>
</template>

<script>
import FcGlobalFilters from '@/web/components/filters/FcGlobalFilters.vue';

export default {
  name: 'FcGlobalFilterBox',
  components: {
    FcGlobalFilters,
  },
  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss">
.fc-filter-box {
  opacity: 0.9;
  display: inline-block;
  min-width: 125px;
}
</style>
