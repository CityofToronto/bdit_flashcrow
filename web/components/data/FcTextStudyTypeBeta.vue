<template>
  <span class="fc-text-study-type-beta">{{text}}</span>
</template>

<script>
import { StudyType } from '@/lib/Constants';

const BETA = 'Beta';

export default {
  name: 'FcTextStudyTypeBeta',
  props: {
    large: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    studyType: StudyType,
  },
  computed: {
    hasBeta() {
      return this.studyType.beta !== null;
    },
    text() {
      if (!this.hasBeta) {
        return null;
      }
      if (this.small) {
        return BETA;
      }
      const { beta } = this.studyType;
      if (this.large) {
        return `${BETA} - ${beta.descriptionLarge}`;
      }
      return `${BETA} - ${beta.description}`;
    },
  },
};
</script>

<style lang="scss">
.fc-text-study-type-beta {
  background-color: #fff9d3;
  color: #9b6e0c;
}
</style>
