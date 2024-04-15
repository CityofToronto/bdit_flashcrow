<template>
  <div>
    <p
      v-for="(line, i) in description"
      :key="i"
      class="body-1 mb-1">
      {{line}}
    </p>
    <FcButton
    type="tertiary"
    class="px-0"
    @click="actionShowRequest">
    View Request
  </FcButton>
  </div>
</template>

<script>
import FcButton from '../../inputs/FcButton.vue';

export default {
  name: 'FcPopupDetailsStudyRequest',
  components: {
    FcButton,
  },
  props: {
    featureDetails: Object,
  },
  computed: {
    description() {
      const {
        studyType, studyId, studyHours,
      } = this.featureDetails;
      return [`#${studyId} - ${studyType}`, `${studyHours === null ? 'No hours info' : studyHours} hours`];
    },
  },
  methods: {
    actionShowRequest() {
      const { studyId } = this.featureDetails;
      const route = {
        name: 'requestStudyView',
        params: { id: studyId },
      };
      this.$router.push(route);
    },
  },
};
</script>
