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
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);
      await this.actionSetStudyLocation(location);
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
