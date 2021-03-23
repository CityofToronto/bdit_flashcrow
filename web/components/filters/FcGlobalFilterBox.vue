<template>
  <v-card width="472">
    <v-card-text>
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
