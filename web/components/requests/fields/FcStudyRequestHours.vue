<template>
  <FcSelectEnum
    v-model="v.hours.$model"
    hide-details="auto"
    item-text="description"
    label="Hours"
    :messages="messagesHours"
    :of-type="StudyHours"
    outlined
    v-bind="$attrs" />
</template>

<script>
import { StudyHours } from '@/lib/Constants';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';

export default {
  name: 'FcStudyRequestHours',
  components: {
    FcSelectEnum,
  },
  props: {
    v: Object,
  },
  data() {
    return { StudyHours };
  },
  computed: {
    messagesHours() {
      const hours = this.v.hours.$model;
      if (hours === null) {
        return [];
      }
      return hours.hint;
    },
  },
  created() {
    this.v.duration.$model = null;
    this.v.hours.$model = StudyHours.ROUTINE;
  },
};
</script>
