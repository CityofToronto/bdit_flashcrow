<template>
  <div class="fc-drawer-request-study d-flex fill-height flex-column">
    <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 py-2 shading">
      <FcButton
        v-if="isCreate"
        type="icon"
        @click="actionNavigateBack">
        <v-icon>mdi-chevron-left</v-icon>
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
          type="tertiary"
          @click="actionNavigateBack">
          Cancel
        </FcButton>
        <FcButton
          :disabled="$v.$invalid"
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

        <section class="mt-5 pr-5">
          <h2 class="headline">Study Type</h2>
          <FcCheckboxGroupChips
            v-model="studyTypes"
            :items="itemsStudyType"></FcCheckboxGroupChips>
          <v-messages
            class="mt-1"
            color="error"
            :value="errorMessagesStudies"></v-messages>
        </section>

        <FcDetailsStudyRequest
          v-model="studyRequest"
          class="pr-5"
          :v="$v.studyRequest" />

        <template v-for="(_, i) in studyRequest.studies">
          <v-divider
            :key="'divider_' + i"
            class="my-3"></v-divider>
          <FcDetailsStudy
            :key="'study_' + i"
            v-model="studyRequest.studies[i]"
            class="pr-5"
            :v="$v.studyRequest.studies.$each[i]" />
        </template>

        <section
          v-if="isCreate"
          class="pr-5 mt-6 text-right">
          <div>
            <FcButton
              type="tertiary"
              @click="actionNavigateBack">
              Cancel
            </FcButton>
            <FcButton
              :disabled="$v.$invalid"
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
  mapMutations,
  mapState,
} from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import { StudyHours, StudyType } from '@/lib/Constants';
import {
  getStudyRequest,
} from '@/lib/api/WebApi';
import {
  REQUEST_STUDY_REQUIRES_LOCATION,
  REQUEST_STUDY_REQUIRES_STUDIES,
  REQUEST_STUDY_TIME_TO_FULFILL,
} from '@/lib/i18n/Strings';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcDetailsStudy from '@/web/components/FcDetailsStudy.vue';
import FcDetailsStudyRequest from '@/web/components/FcDetailsStudyRequest.vue';
import FcCheckboxGroupChips from '@/web/components/inputs/FcCheckboxGroupChips.vue';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

function makeStudy(studyType) {
  return {
    studyType,
    daysOfWeek: [2, 3, 4],
    duration: 24,
    hours: StudyHours.ROUTINE,
    notes: '',
  };
}

function makeStudyRequest(now) {
  const dueDate = now.plus({ months: 3 });
  const studyRequest = {
    serviceRequestId: null,
    urgent: false,
    urgentReason: null,
    assignedTo: null,
    dueDate,
    estimatedDeliveryDate: null,
    reasons: [],
    ccEmails: [],
    centrelineId: null,
    centrelineType: null,
    geom: null,
    studies: [],
  };
  return studyRequest;
}

export default {
  name: 'FcDrawerRequestStudy',
  mixins: [FcMixinRouteAsync],
  components: {
    FcButton,
    FcCheckboxGroupChips,
    FcDetailsStudy,
    FcDetailsStudyRequest,
  },
  data() {
    return {
      REQUEST_STUDY_TIME_TO_FULFILL,
      studyRequest: null,
      studyTypes: [],
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
    errorMessagesStudies() {
      const errors = [];
      if (!this.$v.studyRequest.studies.required) {
        errors.push(REQUEST_STUDY_REQUIRES_STUDIES.text);
      }
      return errors;
    },
    estimatedDeliveryDate() {
      const { now, studyRequest } = this;
      if (studyRequest === null) {
        return null;
      }
      const { dueDate, urgent } = studyRequest;
      if (urgent) {
        return dueDate;
      }
      const oneWeekBeforeDueDate = dueDate.minus({ weeks: 1 });
      const twoMonthsOut = now.plus({ months: 2 });
      if (oneWeekBeforeDueDate.valueOf() < twoMonthsOut.valueOf()) {
        return twoMonthsOut;
      }
      return oneWeekBeforeDueDate;
    },
    isCreate() {
      return this.$route.name === 'requestStudyNew';
    },
    isSupervisor() {
      return Object.prototype.hasOwnProperty.call(this.$route.query, 'isSupervisor');
    },
    itemsStudyType() {
      const itemsStudyType = StudyType.enumValues.map((studyType) => {
        const { label: text } = studyType;
        return { text, value: studyType };
      });
      return ArrayUtils.sortBy(itemsStudyType, ({ text }) => text);
    },
    routeFinish() {
      if (this.isCreate) {
        const { centrelineId, centrelineType } = this.location;
        return {
          name: 'viewDataAtLocation',
          params: { centrelineId, centrelineType },
        };
      }
      if (this.studyRequest === null) {
        return null;
      }
      const { id } = this.studyRequest;
      const route = {
        name: 'requestStudyView',
        params: { id },
      };
      if (this.isSupervisor) {
        route.query = { isSupervisor: true };
      }
      return route;
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
    ...mapState(['location', 'now']),
  },
  watch: {
    estimatedDeliveryDate() {
      this.studyRequest.estimatedDeliveryDate = this.estimatedDeliveryDate;
    },
    location() {
      this.updateStudyRequestLocation();
    },
    studyTypes(studyTypes, studyTypesPrev) {
      studyTypes.forEach((studyType) => {
        if (!studyTypesPrev.includes(studyType)) {
          this.actionAddStudy(studyType);
        }
      });
      studyTypesPrev.forEach((studyType) => {
        if (!studyTypes.includes(studyType)) {
          this.actionRemoveStudy(studyType);
        }
      });
    },
  },
  validations: ValidationsStudyRequest.validations,
  methods: {
    actionAddStudy(studyType) {
      const item = makeStudy(studyType);
      this.studyRequest.studies.push(item);
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
    actionRemoveStudy(studyType) {
      const i = this.studyRequest.studies.findIndex(
        ({ studyType: studyType0 }) => studyType0 === studyType,
      );
      if (i !== -1) {
        this.studyRequest.studies.splice(i, 1);
      }
    },
    onFinish() {
      const { isSupervisor, studyRequest } = this;
      this.saveStudyRequest({ isSupervisor, studyRequest });
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
      this.setLocation(studyRequestLocation);
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
    ...mapMutations(['setLocation']),
    ...mapActions(['saveStudyRequest']),
  },
};
</script>

<style lang="scss">
.fc-drawer-request-study {
  max-height: 100vh;
}
</style>
