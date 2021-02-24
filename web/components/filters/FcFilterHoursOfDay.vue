<template>
  <fieldset>
    <legend class="headline">Time of Day</legend>

    <v-slider
      v-model="internalValue[0]"
      class="mt-11"
      :error-messages="errorMessages"
      label="From Hour"
      :max="24"
      :min="0"
      thumb-label="always" />

    <v-slider
      v-model="internalValue[1]"
      class="mt-11"
      :error-messages="errorMessages"
      hide-details="auto"
      label="To Hour"
      :max="24"
      :min="0"
      thumb-label="always" />
  </fieldset>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcFilterHoursOfDay',
  mixins: [FcMixinVModelProxy(Array)],
  props: {
    errorMessages: {
      type: Array,
      default() { return []; },
    },
  },
};
</script>
