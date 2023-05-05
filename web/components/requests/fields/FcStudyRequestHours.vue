<template>
  <v-select
    v-model="storeEnumToStrInterface"
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
      const options = StudyHours.enumValues.filter(
        option => this.hourOptionsByStudyType.includes(option.name),
      );
      return options;
    },
    store: {
      get() {
        return this.v.hours.$model;
      },
      set(val) {
        this.v.hours.$model = val;
      },
    },
    storeEnumToStrInterface: {
      get() {
        return this.store.name;
      },
      set(val) {
        this.store = StudyHours.enumValueOf(val);
      },
    },
    selectedTimes() {
      let hint = '';
      if (!this.studyType.other) hint = this.store.hint;
      return hint;
    },
    hourOptionsByStudyType() {
      return this.studyType.hourOptions;
    },
    studyType() {
      return this.v.studyType.$model;
    },
  },
};
</script>
