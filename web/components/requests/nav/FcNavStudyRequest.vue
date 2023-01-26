<template>
  <div class="fc-nav-study-request d-flex flex-grow-0 flex-shrink-0 pt-4 px-5 shading">
    <div>
      <FcHeadingStudyRequest
        class="mb-4"
        :is-bulk="isBulk"
        :loading="loading"
        :location-description="locationDescription"
        :study-request="studyRequest" />
      <FcBreadcrumbsStudyRequest
        class="mb-6"
        :loading="loading"
        :location-description="locationDescription"
        :study-request="studyRequest"
        :study-request-bulk-name="studyRequestBulkName" />
    </div>

    <v-spacer></v-spacer>

    <FcButton
      v-if="(userIsSrAdmin || userIsStudyRequester) && !isEditing"
      class="ml-8"
      :disabled="!canEdit"
      type="secondary"
      @click="actionEdit">
      <v-icon color="primary" left>mdi-pencil</v-icon> Edit
    </FcButton>

    <slot></slot>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { StudyRequestStatus } from '@/lib/Constants';
import { getLocationByCentreline } from '@/lib/api/WebApi';
import { getStudyRequestLocation } from '@/lib/geo/CentrelineUtils';
import { bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcBreadcrumbsStudyRequest from '@/web/components/requests/nav/FcBreadcrumbsStudyRequest.vue';
import FcHeadingStudyRequest from '@/web/components/requests/nav/FcHeadingStudyRequest.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcNavStudyRequest',
  mixins: [
    FcMixinAuthScope,
  ],
  components: {
    FcButton,
    FcBreadcrumbsStudyRequest,
    FcHeadingStudyRequest,
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
  data() {
    return {
      loading: false,
      location: null,
    };
  },
  computed: {
    userIsSrAdmin() {
      return this.hasAuthScope(this.AuthScope.STUDY_REQUESTS_ADMIN);
    },
    userIsStudyRequester() {
      let isRequester = false;
      if (this.studyRequest !== null) isRequester = this.auth.user.id === this.studyRequest.userId;
      return isRequester;
    },
    canEdit() {
      const { status } = this;
      const srs = StudyRequestStatus;
      let canEdit = false;
      if (status === null) {
        canEdit = false;
      } else if (this.userIsSrAdmin) {
        if (this.isBulk) {
          canEdit = true;
        } else if (status !== srs.CANCELLED && status !== srs.COMPLETED) {
          canEdit = true;
        }
      } else if (this.userIsStudyRequester) {
        if (this.isBulk) {
          canEdit = true;
        } else if (status === srs.REQUESTED || status === srs.CHANGES_NEEDED) {
          canEdit = true;
        }
      }
      return canEdit;
    },
    isBulk() {
      const { name } = this.$route;
      return name === 'requestStudyBulkView' || name === 'requestStudyBulkEdit';
    },
    locationDescription() {
      if (this.isBulk) {
        return null;
      }
      const location = getStudyRequestLocation(this.studyRequest, this.location);
      if (location === null) {
        return null;
      }
      return location.description;
    },
    routeNavigateBack() {
      const { name } = this.$route;
      if (name === 'requestStudyBulkView') {
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
        return {
          name: 'requestStudyBulkView',
          params: { id: this.studyRequest.id },
        };
      }
      if (name === 'requestStudyEdit') {
        return {
          name: 'requestStudyView',
          params: { id: this.studyRequest.id },
        };
      }
      return this.routeBackViewRequest;
    },
    isEditing() {
      const { name } = this.$route;
      let isEditing = false;
      if (name === 'requestStudyBulkEdit' || name === 'requestStudyEdit') {
        isEditing = true;
      }
      return isEditing;
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
    ...mapState(['auth', 'backViewRequest']),
    ...mapGetters(['routeBackViewRequest']),
  },
  watch: {
    studyRequest: {
      handler() {
        this.syncStudyRequestLocation();
      },
      immediate: true,
    },
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
    async syncStudyRequestLocation() {
      if (this.isBulk || this.studyRequest === null) {
        this.location = null;
        return;
      }
      this.loading = true;
      const { centrelineId, centrelineType } = this.studyRequest;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);
      this.location = location;
      this.loading = false;
    },
  },
};
</script>
