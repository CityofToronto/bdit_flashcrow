<template>
  <h2 class="display-3">
    <span>
      {{title}}:
    </span>
    <FcProgressCircular
      v-if="loading"
      aria-label="Loading study request subtitle"
      small />
    <span
      v-else
      class="font-weight-regular">
      {{subtitle}}
    </span>
  </h2>
</template>

<script>
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';

export default {
  name: 'FcHeadingStudyRequest',
  components: {
    FcProgressCircular,
  },
  props: {
    isBulk: Boolean,
    loading: Boolean,
    locationDescription: String,
    studyRequest: Object,
  },
  computed: {
    subtitle() {
      if (this.studyRequest === null) {
        return null;
      }
      if (this.isBulk) {
        return this.studyRequest.name;
      }
      return this.locationDescription;
    },
    title() {
      const { name, params: { id } } = this.$route;
      if (name === 'requestStudyView' || name === 'requestStudyEdit') {
        return `Request #${id}`;
      }
      if (name === 'requestStudyBulkView' || name === 'requestStudyBulkEdit') {
        return `Bulk Request #${id}`;
      }
      return 'Loading\u2026';
    },
  },
};
</script>
