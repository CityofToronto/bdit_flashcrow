<template>
  <div class="fc-nav-study-request flex-grow-0 flex-shrink-0">
    <v-row
      class="align-center px-3 py-2 shading"
      no-gutters>
      <v-col cols="3">
        <FcButton
          :loading="labelNavigateBack === null"
          type="secondary"
          @click="actionNavigateBack">
          <v-icon left>mdi-chevron-left</v-icon>
          {{labelNavigateBack}}
        </FcButton>
      </v-col>
      <v-col class="text-center" cols="6">
        <h1
          class="headline text-truncate"
          :title="subtitle === null ? title : (title + ': ' + subtitle)">
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
        </h1>
      </v-col>
      <v-col class="text-right" cols="3">
        <FcButton
          v-if="showEdit"
          :disabled="!canEdit || status === null || !status.editable"
          type="secondary"
          @click="actionEdit">
          <v-icon color="primary" left>mdi-pencil</v-icon> Edit
        </FcButton>

        <slot></slot>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { AuthScope, LocationMode } from '@/lib/Constants';
import { getLocationsDescription } from '@/lib/geo/CentrelineUtils';
import { bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcNavStudyRequest',
  mixins: [FcMixinAuthScope],
  components: {
    FcButton,
  },
  props: {
    isCreate: {
      type: Boolean,
      default: false,
    },
    studyRequest: Object,
    studyRequestBulkName: {
      type: String,
      default: null,
    },
  },
  computed: {
    canEdit() {
      if (this.hasAuthScope(AuthScope.STUDY_REQUESTS_ADMIN)) {
        return true;
      }
      if (this.studyRequest !== null && this.hasAuthScope(AuthScope.STUDY_REQUESTS)) {
        return this.auth.user.id === this.studyRequest.userId;
      }
      return false;
    },
    labelNavigateBack() {
      const { name } = this.$route;
      if (name === 'requestStudyBulkView' || name === 'requestStudyNew') {
        return this.labelNavigateBackViewRequest;
      }
      if (name === 'requestStudyView') {
        if (this.studyRequest === null || this.studyRequest.studyRequestBulkId === null) {
          return this.labelNavigateBackViewRequest;
        }
        return this.studyRequestBulkName;
      }
      if (name === 'requestStudyBulkEdit') {
        if (this.studyRequest === null) {
          return null;
        }
        const { id } = this.$route.params;
        return `Bulk Request #${id}`;
      }
      if (name === 'requestStudyEdit') {
        const { id } = this.$route.params;
        return `Request #${id}`;
      }
      return this.labelNavigateBackViewRequest;
    },
    labelNavigateBackViewRequest() {
      const { name: backViewRequestName } = this.backViewRequest;
      if (backViewRequestName === 'requestsTrack') {
        return 'Requests';
      }
      if (this.locationsEmpty) {
        return 'View Map';
      }
      return 'View Data';
    },
    routeNavigateBack() {
      const { name } = this.$route;
      if (name === 'requestStudyBulkView' || name === 'requestStudyNew') {
        return this.routeBackViewRequest;
      }
      if (name === 'requestStudyView') {
        if (this.studyRequest === null || this.studyRequest.studyRequestBulkId === null) {
          return this.routeBackViewRequest;
        }
        return {
          name: 'requestStudyBulkView',
          params: { id: this.studyRequest.studyRequestBulkId },
        };
      }
      if (name === 'requestStudyBulkEdit') {
        const { id } = this.$route.params;
        return {
          name: 'requestStudyBulkView',
          params: { id },
        };
      }
      if (name === 'requestStudyEdit') {
        const { id } = this.$route.params;
        return {
          name: 'requestStudyView',
          params: { id },
        };
      }
      return this.routeBackViewRequest;
    },
    showEdit() {
      const { name } = this.$route;
      return name === 'requestStudyBulkView' || name === 'requestStudyView';
    },
    status() {
      if (this.studyRequest === null) {
        return null;
      }
      const { name } = this.$route;
      if (name === 'requestStudyBulkView') {
        return bulkStatus(this.studyRequest.studyRequests);
      }
      if (name === 'requestStudyView') {
        return this.studyRequest.status;
      }
      return null;
    },
    subtitle() {
      if (this.studyRequest === null) {
        return null;
      }
      const { name } = this.$route;
      if (name === 'requestStudyBulkView') {
        return this.studyRequest.name;
      }
      if (name === 'requestStudyNew' || name === 'requestStudyView') {
        return getLocationsDescription(this.locationsSelection.locations);
      }
      if (name === 'requestStudyBulkEdit') {
        return this.studyRequest.name;
      }
      if (name === 'requestStudyEdit') {
        return getLocationsDescription(this.locationsSelection.locations);
      }
      return null;
    },
    title() {
      const { name, params: { id } } = this.$route;
      if (name === 'requestStudyBulkView') {
        return `Bulk Request #${id}`;
      }
      if (name === 'requestStudyNew') {
        if (this.locationMode === LocationMode.SINGLE || this.detailView) {
          return 'New Request';
        }
        return 'New Bulk Request';
      }
      if (name === 'requestStudyView') {
        return `Request #${id}`;
      }
      if (name === 'requestStudyBulkEdit') {
        return `Edit Bulk Request #${id}`;
      }
      if (name === 'requestStudyEdit') {
        return `Edit Request #${id}`;
      }
      return 'Loading\u2026';
    },
    ...mapState(['backViewRequest', 'locationMode', 'locationsSelection']),
    ...mapState('viewData', ['detailView']),
    ...mapGetters([
      'locationActive',
      'locationsEmpty',
      'locationsRouteParams',
      'routeBackViewRequest',
    ]),
  },
  methods: {
    actionEdit() {
      let { name } = this.$route;
      if (name === 'requestStudyBulkView') {
        name = 'requestStudyBulkEdit';
      } else if (name === 'requestStudyView') {
        name = 'requestStudyEdit';
      } else {
        return;
      }
      const { id } = this.studyRequest;
      const route = { name, params: { id } };
      this.$router.push(route);
    },
    actionNavigateBack() {
      this.$router.push(this.routeNavigateBack);
    },
  },
};
</script>
