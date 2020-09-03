<template>
  <v-stepper
    v-model="internalValue"
    class="elevation-0">
    <v-stepper-header class="elevation-0">
      <v-stepper-step
        :complete="internalValue > 1"
        editable
        :step="1">
        Select intersections
      </v-stepper-step>

      <v-icon small>mdi-chevron-right</v-icon>

      <v-stepper-step
        :complete="internalValue > 2"
        editable
        :step="2">
        Select midblocks
      </v-stepper-step>

      <v-icon small>mdi-chevron-right</v-icon>

      <v-stepper-step
        :complete="internalValue > 3"
        editable
        :step="3">
        Request details
      </v-stepper-step>

      <v-icon small>mdi-chevron-right</v-icon>

      <v-stepper-step
        editable
        :step="4">
        Review &amp; Submit
      </v-stepper-step>
    </v-stepper-header>
  </v-stepper>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStepperStudyRequestBulk',
  mixins: [FcMixinVModelProxy(Number)],
};
</script>
