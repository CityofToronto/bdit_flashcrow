<template>
  <div>
    <p
      v-for="(line, i) in description"
      :key="i"
      class="body-1 mb-1">
      {{line}}
    </p>
  </div>
</template>

<script>
export default {
  name: 'FcPopupDetailsStudyRequest',
  props: {
    featureDetails: Object,
  },
  computed: {
    description() {
      const {
        studyType, studyId, studyHours,
      } = this.featureDetails;
      return [`#${studyId} - ${studyType}`, `${studyHours === null ? 'No hours info' : studyHours}`];
    },
  },
};
</script>
