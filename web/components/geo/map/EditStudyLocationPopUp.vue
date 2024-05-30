<template>
  <div>
    <FcButton type="tertiary" @click="actionSelected">
      Set Location
    </FcButton>
    <FcDialogConfirm
      v-model="showIncompatableDialog" textCancel="Cancel"
      textOk="Change Location" title="Invalid location for Study Type" okButtonType="primary"
      @action-ok="actionForceStudyLocation">
      <span class="body-1">
        The location you have selected is not valid for this Study Type.<br />
        Changing to this location will require the Study Request details to be manually updated.
      </span>
    </FcDialogConfirm>
  </div>

</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { getLocationByCentreline, getStudyRequest } from '@/lib/api/WebApi';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';

export default {
  name: 'EditStudyLocationPopUp',
  components: {
    FcButton,
    FcDialogConfirm,
  },
  data() {
    return {
      showIncompatableDialog: false,
      forcedLocation: null,
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
      const validStudiesArray = await getLocationStudyTypes(location);
      return validStudiesArray.includes(studyType);
    },
    async actionSetStudyLocation(location) {
      const { description } = location;
      this.setToastInfo(`Set study location to ${description}.`);
      await this.setSelectedStudyRequestsLocation(location);
    },
    async actionForceStudyLocation() {
      await this.setSelectedStudyRequestsLocation(this.forcedLocation);
    },
    async actionSelected() {
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);
      if (await this.isCompatibleLocationChange(location)) {
        await this.actionSetStudyLocation(location);
      } else {
        this.showIncompatableDialog = true;
        this.forcedLocation = location;
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
