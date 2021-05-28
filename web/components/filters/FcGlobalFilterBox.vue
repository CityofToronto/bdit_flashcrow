<template>
  <v-card width="448">
    <v-card-text class="px-4 pa-3">
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
