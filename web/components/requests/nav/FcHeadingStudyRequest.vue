<template>
  <h2 class="display-3">
    <span>
      {{title}}:
    </span>
    <v-progress-circular
      v-if="subtitle === null"
      color="primary"
      indeterminate
      :size="20"
      :width="2" />
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

export default {
  name: 'FcHeadingStudyRequest',
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
