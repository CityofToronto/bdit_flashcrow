<template>
  <v-select
    v-model="internalValue"
    :items="hourOptions"
    item-text="description"
    item-value="name"
    outlined
    label="Hours"
    :messages="selectedTimes"
    v-bind="$attrs" />
</template>

<script>
import { StudyHours } from '@/lib/Constants';

export default {
  name: 'FcStudyRequestHours',
  props: {
    v: Object,
  },
  computed: {
    hourOptions() {
      const options = StudyHours.enumValues;
      return options;
    },
    selectedTimes() {
      return this.v.hours.$model.hint;
    },
    internalValue: {
      get() {
        return this.v.hours.$model.name;
      },
      set(val) {
        this.v.hours.$model = StudyHours.enumValueOf(val);
      },
    },
  },
};
</script>
