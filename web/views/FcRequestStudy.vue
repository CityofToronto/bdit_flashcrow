<template>
  <div class="fc-request-study d-flex fill-height flex-column">
    <v-toolbar class="flex-grow-0 flex-shrink-0" dense>
      <v-btn
        icon
        @click="$router.go(-1)">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{title}}</v-toolbar-title>
    </v-toolbar>
    <section class="flex-grow-1 flex-shrink-0">
      <v-progress-linear
        v-if="loadingStudyRequest"
        indeterminate />
      <template v-else>
        <div class="fill-height pa-3 overflow-y-auto">
          <h2>Request Details</h2>
          <v-messages
            class="mt-1"
            color="error"
            :value="errorMessagesLocation"></v-messages>
          <FcDetailsStudyRequest
            v-model="studyRequest"
            :v="$v.studyRequest" />

          <h2 class="mt-4">Studies</h2>
          <FcDetailsStudy
              v-for="(_, i) in studyRequest.studies"
              :key="i"
              v-model="studyRequest.studies[i]"
              :v="$v.studyRequest.studies.$each[i]"
              @remove-study="onRemoveStudy(i)" />
          <v-menu>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-bind="attrs"
                v-on="on"
                block
                :color="$v.studyRequest.studies.required ? '' : 'primary'">
                <v-icon left>mdi-plus</v-icon>Add Study
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="{ label, value, warning } in studyTypesWithWarnings"
                :key="value"
                @click="onAddStudy(value)">
                <v-list-item-title>
                  <v-icon v-if="warning !== null">mdi-alert</v-icon> {{label}}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-messages
            class="mt-1"
            color="error"
            :value="errorMessagesStudies"></v-messages>
          <v-btn
            block
            class="mt-6"
            color="primary"
            :disabled="$v.$invalid"
            @click="onFinish">
            {{labelFinish}}
          </v-btn>
        </div>
      </template>
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

import {
  COUNT_TYPES,
  HttpStatus,
} from '@/lib/Constants';
import {
  getStudyRequest,
} from '@/lib/api/WebApi';
import {
  REQUEST_STUDY_FORBIDDEN,
  REQUEST_STUDY_NOT_FOUND,
  REQUEST_STUDY_REQUIRES_LOCATION,
  REQUEST_STUDY_REQUIRES_STUDIES,
} from '@/lib/i18n/Strings';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcDetailsStudy from '@/web/components/FcDetailsStudy.vue';
import FcDetailsStudyRequest from '@/web/components/FcDetailsStudyRequest.vue';

function makeStudy(studyType) {
  return {
    studyType,
    daysOfWeek: [2, 3, 4],
    duration: 24,
    hours: 'ROUTINE',
    notes: '',
  };
}

function makeStudyRequest(location, now) {
  const dueDate = now.plus({ months: 3 });
  const studyRequest = {
    serviceRequestId: null,
    priority: 'STANDARD',
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

function getToast(err) {
  if (err.statusCode === HttpStatus.FORBIDDEN) {
    return REQUEST_STUDY_FORBIDDEN;
  }
  if (err.statusCode === HttpStatus.NOT_FOUND) {
    return REQUEST_STUDY_NOT_FOUND;
  }
  return {
    variant: 'error',
    text: err.message,
  };
}

export default {
  name: 'FcRequestStudy',
  components: {
    FcDetailsStudy,
    FcDetailsStudyRequest,
  },
  data() {
    return {
      loadingStudyRequest: true,
      studyRequest: null,
    };
  },
  computed: {
    errorMessagesLocation() {
      const errors = [];
      if (!this.$v.studyRequest.centrelineId.required
        || !this.$v.studyRequest.centrelineType.required
        || !this.$v.studyRequest.geom.required) {
        errors.push(REQUEST_STUDY_REQUIRES_LOCATION.text);
      }
      return errors;
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
      const { dueDate, priority } = studyRequest;
      if (priority === 'URGENT') {
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
    labelFinish() {
      if (this.isCreate) {
        return 'Submit';
      }
      return 'Save';
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
    studyTypesWithWarnings() {
      const studyTypesSelected = new Set();
      this.studyRequest.studies.forEach(({ studyType: value }) => {
        studyTypesSelected.add(value);
      });
      return COUNT_TYPES.map(({ label, value }) => {
        // let warning = null;
        if (studyTypesSelected.has(value)) {
          // warning = STUDY_DUPLICATE.getModalOptions({ label });
        } else if (!this.studyTypesRelevantToLocation.includes(value)) {
          // warning = STUDY_IRRELEVANT_TYPE.getModalOptions({ label });
        }
        return { label, value, warning: null };
      });
    },
    title() {
      if (this.isCreate) {
        return 'New Study Request';
      }
      const { id } = this.$route.params;
      return `Edit Request #${id}`;
    },
    ...mapGetters(['studyTypesRelevantToLocation']),
    ...mapState(['location', 'now']),
  },
  watch: {
    estimatedDeliveryDate() {
      this.studyRequest.estimatedDeliveryDate = this.estimatedDeliveryDate;
    },
    location() {
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
  },
  validations: ValidationsStudyRequest.validations,
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.syncFromRoute(to);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.syncFromRoute(to)
      .then(() => {
        next();
      }).catch((err) => {
        next(err);
      });
  },
  methods: {
    onAddStudy(studyType) {
      const { warning } = this.studyTypesWithWarnings
        .find(({ value }) => value === studyType);
      const item = makeStudy(studyType);
      if (warning === null) {
        this.studyRequest.studies.push(item);
      } else {
        warning.data.action = () => {
          this.studyRequest.studies.push(item);
        };
        // this.setDialog(warning);
      }
    },
    onFinish() {
      const { isSupervisor, studyRequest } = this;
      this.saveStudyRequest({ isSupervisor, studyRequest });
      this.$router.push(this.routeFinish);
    },
    onRemoveStudy(i) {
      this.studyRequest.studies.splice(i, 1);
    },
    async syncFromRoute(to) {
      if (this.isCreate) {
        const { location, now } = this;
        this.studyRequest = makeStudyRequest(location, now);
        this.loadingStudyRequest = false;
        return;
      }
      const { id } = to.params;
      try {
        this.loadingStudyRequest = true;
        const { studyRequest, studyRequestLocation } = await getStudyRequest(id);
        this.setLocation(studyRequestLocation);
        this.studyRequest = studyRequest;

        this.loadingStudyRequest = false;
      } catch (err) {
        const toast = getToast(err);
        this.setToast(toast);
        this.$router.push({ name: 'viewData' });
      }
    },
    ...mapMutations(['setLocation']),
    ...mapActions(['saveStudyRequest', 'setToast']),
  },
};
</script>

<style lang="postcss">
.fc-request-study {
  max-height: 100vh;
  & > section {
    max-height: calc(100vh - 48px);
  }
}
</style>
