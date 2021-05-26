<template>
  <FcButton
    type="tertiary"
    @click="actionSelected">
    {{textActionSelected}}
  </FcButton>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

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
      if (this.locationsEditIndex === -1) {
        return 'Add Location';
      }
      return `Set Location #${this.locationsEditIndex + 1}`;
    },
    ...mapState('editRequests', ['locationsEditIndex']),
    ...mapGetters('editRequests', ['locations']),
  },
  methods: {
    async actionAddLocation(location) {
      if (this.locationsEditIndex === -1) {
        const { description } = location;
        this.setToastInfo(`Added ${description} to selected locations.`);
      }
      this.addStudyRequestAtLocation(location);
    },
    async actionSetLocation(i, location) {
      const { description } = location;
      this.setToastInfo(`Set study location to ${description}.`);
      this.setStudyRequestLocation({ i, location });
      this.setLocationsEditIndex(-1);
    },
    async actionSelected() {
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);

      if (this.locationsEditIndex !== -1) {
        await this.actionSetLocation(this.locationsEditIndex, location);
      } else {
        await this.actionAddLocation(location);
      }
    },
    ...mapMutations('editRequests', ['setStudyRequestLocation']),
    ...mapActions('editRequests', ['addStudyRequestAtLocation']),
  },
};
</script>
