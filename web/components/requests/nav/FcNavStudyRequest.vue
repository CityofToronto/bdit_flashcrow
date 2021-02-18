<template>
  <div class="fc-nav-study-request d-flex flex-grow-0 flex-shrink-0 pt-4 px-5 shading">
    <div>
      <FcHeadingStudyRequest
        class="mb-4"
        :study-request="studyRequest" />
      <FcBreadcrumbsStudyRequest
        v-if="showBreadcrumbs"
        class="mb-6"
        :study-request="studyRequest"
        :study-request-bulk-name="studyRequestBulkName" />
    </div>

    <v-spacer></v-spacer>

    <FcButton
      v-if="showEdit"
      class="ml-8"
      :disabled="!canEdit || status === null || !status.editable"
      type="secondary"
      @click="actionEdit">
      <v-icon color="primary" left>mdi-pencil</v-icon> Edit
    </FcButton>

    <slot></slot>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { AuthScope } from '@/lib/Constants';

import { bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcBreadcrumbsStudyRequest from '@/web/components/requests/nav/FcBreadcrumbsStudyRequest.vue';
import FcHeadingStudyRequest from '@/web/components/requests/nav/FcHeadingStudyRequest.vue';
import FcMixinAuthScope from '@/web/mixins/FcMixinAuthScope';

export default {
  name: 'FcNavStudyRequest',
  mixins: [FcMixinAuthScope],
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
    showBreadcrumbs() {
      const { name } = this.$route;
      return name !== 'requestStudyNew';
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
    ...mapState(['backViewRequest']),
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
  },
};
</script>
