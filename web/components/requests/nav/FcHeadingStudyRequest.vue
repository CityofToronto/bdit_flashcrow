<template>
  <h2 class="display-3">
    <span>
      {{title}}:
    </span>
    <FcProgressCircular
      v-if="subtitle === null"
      aria-label="Loading study request subtitle"
      small />
    <span
      v-else
      class="font-weight-regular">
      {{subtitle}}
    </span>
  </h2>
</template>

<script>
import { mapState } from 'vuex';

import { LocationMode } from '@/lib/Constants';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';

export default {
  name: 'FcHeadingStudyRequest',
  components: {
    FcProgressCircular,
  },
  props: {
    studyRequest: Object,
  },
  computed: {
    subtitle() {
      if (this.studyRequest === null) {
        return null;
      }
      const { name } = this.$route;
      if (name === 'requestStudyBulkView') {
        return this.studyRequest.name;
      }
      if (name === 'requestStudyNew' || name === 'requestStudyView') {
        return getLocationsSelectionDescription(this.locationsSelection);
      }
      if (name === 'requestStudyBulkEdit') {
        return this.studyRequest.name;
      }
      if (name === 'requestStudyEdit') {
        return getLocationsSelectionDescription(this.locationsSelection);
      }
      return null;
    },
    title() {
      const { name, params: { id } } = this.$route;
      if (name === 'requestStudyNew') {
        if (this.locationMode === LocationMode.SINGLE || this.detailView) {
          return 'New Request';
        }
        return 'New Bulk Request';
      }
      if (name === 'requestStudyView' || name === 'requestStudyEdit') {
        return `Request #${id}`;
      }
      if (name === 'requestStudyBulkView' || name === 'requestStudyBulkEdit') {
        return `Bulk Request #${id}`;
      }
      return 'Loading\u2026';
    },
    ...mapState(['locationMode', 'locationsSelection']),
    ...mapState('viewData', ['detailView']),
  },
};
</script>
