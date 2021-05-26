<template>
  <FcButton
    type="tertiary"
    @click="actionSelected">
    {{textActionSelected}}
  </FcButton>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import { getLocationByCentreline } from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcMapPopupActionViewData',
  components: {
    FcButton,
  },
  props: {
    feature: Object,
  },
  computed: {
    textActionSelected() {
      if (this.indicesSelected.length === 0) {
        return 'Add Study';
      }
      return 'Set Location';
    },
    ...mapState('editRequests', ['indicesSelected']),
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
      this.setSelectedStudyRequestsLocation(location);
    },
    async actionSelected() {
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);

      if (this.indicesSelected.length === 0) {
        await this.actionAddStudy(location);
      } else {
        await this.actionSetStudyLocation(location);
      }
    },
    ...mapMutations(['setToastInfo']),
    ...mapMutations('editRequests', ['setSelectedStudyRequestsLocation']),
    ...mapActions('editRequests', ['addStudyRequestAtLocation']),
  },
};
</script>
