<template>
  <FcButton
    type="tertiary"
    @click="actionSelected">
    Set Location
  </FcButton>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { getLocationByCentreline } from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'EditStudyLocationPopUp',
  data() {
    return {
      originalLocation: null,
      originalStudyRequest: null,
    };
  },
  components: {
    FcButton,
  },
  props: {
    feature: Object,
  },
  computed: {
    ...mapState('editRequests', ['indicesSelected', 'studyRequests']),
  },
  methods: {
    async actionSetStudyLocation(location) {
      const { description } = location;
      this.setToastInfo(`Set study location to ${description}.`);
      await this.setSelectedStudyRequestsLocation(location);
    },
    async actionSelected() {
      const requestId = this.$route.params.id;
      this.originalLocation = JSON.parse(window.localStorage.getItem(`study_${requestId}_location`));
      this.originalStudyRequest = JSON.parse(window.localStorage.getItem(`study_${requestId}_studyRequest`));
      const { centrelineId, centrelineType } = this.feature.properties;
      if (centrelineType === this.originalLocation.centrelineType) {
        const updatedStudyRequest = {
          ...this.originalStudyRequest,
          centrelineId,
          centrelineType,
        };
        await this.setStudyRequestsForStudyRequest(updatedStudyRequest);
        // this.setIndicesSelected([0]);
      } else {
        const feature = { centrelineId, centrelineType };
        const location = await getLocationByCentreline(feature);
        await this.actionSetStudyLocation(location);
      }
    },
    ...mapMutations(['setToastInfo']),
    ...mapMutations('editRequests', ['setIndicesSelected']),
    ...mapActions('editRequests', [
      'addStudyRequestAtLocation',
      'setSelectedStudyRequestsLocation',
      'setStudyRequestsForStudyRequest',
    ]),
  },
};
</script>
