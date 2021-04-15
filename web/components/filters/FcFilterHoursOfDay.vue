<template>
  <fieldset>
    <legend class="headline">Time of Day</legend>

    <v-slider
      v-model="v.hoursOfDayStart.$model"
      class="mt-11"
      :error-messages="errorMessagesHoursOfDayStart"
      label="From Hour"
      :max="24"
      :min="0"
      thumb-label="always" />

    <v-slider
      v-model="v.hoursOfDayEnd.$model"
      class="mt-11"
      :error-messages="errorMessagesHoursOfDayEnd"
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
  mixins: [FcMixinVModelProxy(Object)],
  props: {
    v: Object,
  },
  computed: {
    errorMessagesHoursOfDayStart() {
      const errors = [];
      if (!this.v.hoursOfDayStart.startBeforeEnd) {
        errors.push('From hour must be before to hour');
      }
      return errors;
    },
    errorMessagesHoursOfDayEnd() {
      const errors = [];
      if (!this.v.hoursOfDayEnd.startBeforeEnd) {
        errors.push('From hour must be before to hour');
      }
      return errors;
    },
  },
};
</script>
