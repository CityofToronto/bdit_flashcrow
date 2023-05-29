<template>
  <FcButton
    type="tertiary"
    @click="actionSelected">
    {{textActionSelected}}
  </FcButton>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import { centrelineKey } from '@/lib/Constants';
import { getLocationByCentreline } from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcMapPopupActionRequestEditor',
  components: {
    FcButton,
  },
  props: {
    feature: Object,
  },
  computed: {
    textActionSelected() {
      if (this.indicesSelected.length > 0) {
        return 'Set Location';
      }
      const keyFeature = centrelineKey(this.feature.properties);
      const isSelected = this.studyRequests.some(
        studyRequest => centrelineKey(studyRequest) === keyFeature,
      );
      if (isSelected) {
        return 'Add Another Study';
      }
      return 'Add Study';
    },
    ...mapState('editRequests', ['indicesSelected', 'studyRequests']),
  },
  methods: {
    async actionAddStudy(location) {
      const { description } = location;
      this.setToastInfo(`Added study at ${description}`);
      this.addStudyRequestAtLocation(location);
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

      if (this.indicesSelected.length === 0) {
        await this.actionAddStudy(location);
      } else {
        await this.actionSetStudyLocation(location);
        this.setIndicesSelected([]);
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
