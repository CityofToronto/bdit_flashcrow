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
  watch: {
    'v.hours.$model': function watchHour() {
      this.componentKey += 1;
    },
  },
  beforeMount() {
    this.store = StudyHours.enumValueOf(this.v.studyType.$model.hourOptions);
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
    storeEnumToStrInterface: {
      get() {
        return this.store.name;
      },
      set(val) {
        this.store = StudyHours.enumValueOf(val);
      },
    },
    store: {
      get() {
        return this.v.hours.$model;
      },
      set(val) {
        this.v.hours.$model = val;
      },
    },
    caption() {
      // let { hint } = this.store;
      // if (this.isHourTypeOther) hint = 'Specify hours in Collection Notes';
      return 'awd';
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
