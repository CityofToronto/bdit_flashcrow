<template>
  <v-row class="mb-6" tag="dl">
    <v-col
      v-for="({ cols, name, value }, i) in entries"
      :key="i"
      :cols="cols">
      <dt class="subtitle-1">{{name}}</dt>
      <dd class="mt-1 display-1 font-weight-medium">
        <FcTextReportValue
          text-null="None"
          :value="value" />
      </dd>
    </v-col>
  </v-row>
</template>

<script>
import FcTextReportValue from '@/web/components/data/FcTextReportValue.vue';

export default {
  name: 'FcReportMetadata',
  components: {
    FcTextReportValue,
  },
  props: {
    entries: Array,
  },
};
</script>
