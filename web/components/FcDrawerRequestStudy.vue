<template>
  <div class="fc-drawer-request-study d-flex fill-height flex-column">
    <FcDialogConfirm
      v-model="showConfirmLeave"
      :textCancel="isCreate ? 'Stay on this page' : 'Keep editing'"
      :textOk="isCreate ? 'Quit' : 'Discard'"
      :title="isCreate ? 'Quit study request?' : 'Discard changes?'"
      @action-ok="actionLeave">
      <span class="body-1">
        <span v-if="isCreate">
          Leaving this page will cause a loss of all entered data.
          Are you sure you want to quit?
        </span>
        <span v-else>
          You have made changes to the study request that have not been saved.
          Do you wish to discard these changes?
        </span>
      </span>
    </FcDialogConfirm>
    <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 py-2 shading">
      <FcButton
        v-if="isCreate"
        type="secondary"
        @click="actionNavigateBack">
        <v-icon left>mdi-chevron-left</v-icon>
        {{labelNavigateBack}}
      </FcButton>
      <h1 class="flex-grow-1 headline text-center">
        <span>
          {{title}}:
        </span>
        <span class="font-weight-regular">
          {{subtitle}}
        </span>
      </h1>
      <div v-if="!isCreate">
        <FcButton
          class="mr-2"
          type="tertiary"
          @click="actionNavigateBack">
          Cancel
        </FcButton>
        <FcButton
          :disabled="$v.studyRequest.$invalid"
          type="primary"
          @click="onFinish">
          Save
        </FcButton>
      </div>
    </div>
    <v-divider></v-divider>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loading"
        indeterminate />
      <div
        v-else
        class="pl-5 py-5">
        <v-messages
          v-bind="attrsMessagesTop"></v-messages>

        <FcDetailsStudyRequest
          v-model="studyRequest"
          class="pr-5"
          :is-create="isCreate"
          :v="$v.studyRequest" />

        <section
          v-if="isCreate"
          class="pr-5 mt-6 text-right">
          <div>
            <FcButton
              class="mr-2"
              type="tertiary"
              @click="actionNavigateBack">
              Cancel
            </FcButton>
            <FcButton
              :disabled="$v.studyRequest.$invalid"
              type="primary"
              @click="onFinish">
              Submit Request
            </FcButton>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import { getStudyRequest } from '@/lib/api/WebApi';
import {
  REQUEST_STUDY_REQUIRES_LOCATION,
  REQUEST_STUDY_TIME_TO_FULFILL,
} from '@/lib/i18n/Strings';
import CompositeId from '@/lib/io/CompositeId';
import DateTime from '@/lib/time/DateTime';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcDetailsStudyRequest from '@/web/components/FcDetailsStudyRequest.vue';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

function makeStudyRequest(now) {
  const dueDate = now.plus({ months: 3 });
  return {
    serviceRequestId: null,
    urgent: false,
    urgentReason: null,
    assignedTo: null,
    dueDate,
    estimatedDeliveryDate: null,
    reasons: [],
    ccEmails: [],
    studyType: null,
    daysOfWeek: [2, 3, 4],
    duration: null,
    hours: null,
    notes: '',
    centrelineId: null,
    centrelineType: null,
    geom: null,
  };
}

export default {
  name: 'FcDrawerRequestStudy',
  mixins: [FcMixinRouteAsync],
  components: {
    FcButton,
    FcDetailsStudyRequest,
    FcDialogConfirm,
  },
  data() {
    return {
      leaveConfirmed: false,
      nextRoute: null,
      REQUEST_STUDY_TIME_TO_FULFILL,
      showConfirmLeave: false,
      studyRequest: null,
    };
  },
  computed: {
    attrsMessagesTop() {
      if (!this.$v.studyRequest.centrelineId.required
        || !this.$v.studyRequest.centrelineType.required
        || !this.$v.studyRequest.geom.required) {
        return {
          color: 'error',
          value: [REQUEST_STUDY_REQUIRES_LOCATION.text],
        };
      }
      return {
        value: [REQUEST_STUDY_TIME_TO_FULFILL.text],
      };
    },
    estimatedDeliveryDate() {
      const { now, studyRequest } = this;
      if (studyRequest === null) {
        return null;
      }
      const { dueDate, urgent } = studyRequest;
      if (dueDate === null) {
        return null;
      }
      if (urgent) {
        return dueDate;
      }
      return DateTime.max(
        dueDate.minus({ weeks: 1 }),
        now.plus({ months: 2 }),
      );
    },
    isCreate() {
      return this.$route.name === 'requestStudyNew';
    },
    labelNavigateBack() {
      if (this.isCreate && this.location === null) {
        return 'View Map';
      }
      return 'View Data';
    },
    routeFinish() {
      if (this.isCreate) {
        const s1 = CompositeId.encode(this.locations);
        return {
          name: 'viewDataAtLocation',
          params: { s1 },
        };
      }
      if (this.studyRequest === null) {
        return null;
      }
      const { id } = this.studyRequest;
      return {
        name: 'requestStudyView',
        params: { id },
      };
    },
    subtitle() {
      if (this.location === null) {
        return 'needs location';
      }
      return this.location.description;
    },
    title() {
      if (this.isCreate) {
        return 'Request Study';
      }
      const { id } = this.$route.params;
      return `Edit Request #${id}`;
    },
    ...mapState(['locations', 'now']),
    ...mapGetters(['location']),
  },
  watch: {
    estimatedDeliveryDate() {
      this.studyRequest.estimatedDeliveryDate = this.estimatedDeliveryDate;
    },
    location() {
      this.updateStudyRequestLocation();
    },
  },
  validations: ValidationsStudyRequest,
  beforeRouteLeave(to, from, next) {
    if (this.leaveConfirmed) {
      next();
      return;
    }
    this.nextRoute = to;
    this.showConfirmLeave = true;
    next(false);
  },
  methods: {
    actionLeave() {
      this.leaveConfirmed = true;
      this.$router.push(this.nextRoute);
    },
    actionNavigateBack() {
      if (!this.isCreate) {
        const { id } = this.$route.params;
        this.$router.push({
          name: 'requestStudyView',
          params: { id },
        });
      } else if (this.location === null) {
        this.$router.push({ name: 'viewData' });
      } else {
        const { centrelineId, centrelineType } = this.location;
        this.$router.push({
          name: 'viewDataAtLocation',
          params: { centrelineId, centrelineType },
        });
      }
    },
    onFinish() {
      const { studyRequest } = this;
      this.saveStudyRequest(studyRequest);
      this.leaveConfirmed = true;
      this.$router.push(this.routeFinish);
    },
    async loadAsyncForRoute(to) {
      let studyRequest;
      let studyRequestLocation;
      if (this.isCreate) {
        const { location, now } = this;
        studyRequest = makeStudyRequest(now);
        studyRequestLocation = location;
      } else {
        const { id } = to.params;
        const result = await getStudyRequest(id);
        studyRequest = result.studyRequest;
        studyRequestLocation = result.studyRequestLocation;
      }
      this.studyRequest = studyRequest;
      this.setLocations([studyRequestLocation]);
      this.updateStudyRequestLocation();
    },
    updateStudyRequestLocation() {
      const { location } = this;
      if (location === null) {
        this.studyRequest.centrelineId = null;
        this.studyRequest.centrelineType = null;
        this.studyRequest.geom = null;
      } else {
        const {
          centrelineId,
          centrelineType,
          lng,
          lat,
        } = location;
        const geom = {
          type: 'Point',
          coordinates: [lng, lat],
        };
        this.studyRequest.centrelineId = centrelineId;
        this.studyRequest.centrelineType = centrelineType;
        this.studyRequest.geom = geom;
      }
      this.$v.studyRequest.centrelineId.$touch();
      this.$v.studyRequest.centrelineType.$touch();
      this.$v.studyRequest.geom.$touch();
    },
    ...mapMutations(['setLocations']),
    ...mapActions(['saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study {
  max-height: 100vh;
}
</style>
