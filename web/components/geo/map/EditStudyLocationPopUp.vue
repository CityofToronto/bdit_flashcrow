<template>
  <div>
    <FcButton type="tertiary" @click="actionSelected">
      Set Location
    </FcButton>
    <FcDialogAlert
      v-model="showIncompatableDialog"
      textOk="OK" title="Invalid location for Study Type" okButtonType="primary">
      <span class="body-1">
        We cannot conduct your study at this location.<br />
        The Study Type will need to be saved as one that is
        valid for this location before selecting this location.
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
