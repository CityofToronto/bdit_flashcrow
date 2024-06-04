<template>
  <div>
    <FcButton type="tertiary" @click="actionSelected">
      Set Location
    </FcButton>
    <FcDialogAlert
      v-model="showIncompatableDialog"
      textOk="OK" title="Cannot change location" okButtonType="primary">
      <span class="body-1">
        We cannot conduct a {{this.currentStudyTypeString}} at this location.
        To learn more about studies and the limitations of where they can be
        conducted, email Data Collection at TrafficData@toronto.ca. <br />
        Alternatively, cancel this request and submit a new one. This will
        not affect the turnaround time of your request.
      </span>
    </FcDialogAlert>
  </div>

</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { getLocationByCentreline, getStudyRequest } from '@/lib/api/WebApi';
import FcDialogAlert from '@/web/components/dialogs/FcDialogAlert.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';

export default {
  name: 'EditStudyLocationPopUp',
  components: {
    FcButton,
    FcDialogAlert,
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
        this.showIncompatableDialog = true;
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
