<template>
  <v-select
    v-model="storeEnumToStrInterface"
    :items="hourOptions"
    item-text="description"
    item-value="name"
    :disabled="isStudyTypeOther"
    outlined
    label="Hours"
    :messages="caption"
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
      if (this.isNonStandardLegacyOtherState) {
        options.push(this.store);
      }
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
    caption() {
      let { hint } = this.store;
      if (this.isHourTypeOther) hint = 'Specify hours in Collection Notes';
      return hint;
    },
    hourOptionsByStudyType() {
      return this.studyType.hourOptions;
    },
    isStudyTypeOther() {
      return this.studyType.other;
    },
    isHourTypeOther() {
      return this.store === StudyHours.OTHER;
    },
    isNonStandardLegacyOtherState() {
      return this.isStudyTypeOther && !this.isHourTypeOther;
    },
    studyType() {
      return this.v.studyType.$model;
    },
  },
};
</script>
