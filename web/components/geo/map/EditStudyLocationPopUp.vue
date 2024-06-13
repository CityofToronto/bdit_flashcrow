<template>
  <div>
    <FcButton type="tertiary" @click="actionSelected">
      Set Location
    </FcButton>
  </div>

</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { getLocationByCentreline, getStudyRequest } from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';

export default {
  name: 'EditStudyLocationPopUp',
  components: {
    FcButton,
  },
  data() {
    return {
      showIncompatableDialog: false,
      currentStudyTypeString: null,
    };
  },
  props: {
    feature: Object,
  },
  computed: {
    ...mapState('editRequests', ['indicesSelected', 'studyRequests']),
  },
  methods: {
    async isCompatibleLocationChange(location) {
      const requestId = this.$route.params.id;
      const { studyRequest } = await getStudyRequest(requestId);
      const { studyType } = studyRequest;
      this.currentStudyTypeString = studyType.label;
      const validStudiesArray = await getLocationStudyTypes(location);
      return validStudiesArray.includes(studyType) || studyType.other;
    },
    async actionSetStudyLocation(location) {
      const { description } = location;
      this.setToastInfo(`Set study location to ${description}.`);
      await this.setSelectedStudyRequestsLocation(location);
    },
    async actionSelected() {
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);
      if (await this.isCompatibleLocationChange(location)) {
        await this.actionSetStudyLocation(location);
      } else {
        const msgStudyType = this.currentStudyTypeString;
        this.$emit('showDialog', msgStudyType);
      }
    },
    ...mapMutations(['setToastInfo']),
    ...mapMutations('editRequests', ['setIndicesSelected']),
    ...mapActions('editRequests', [
      'addStudyRequestAtLocation',
      'setSelectedStudyRequestsLocation',
    ]),
  },
};
</script>
