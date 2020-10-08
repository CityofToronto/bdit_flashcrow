<template>
  <section class="d-flex fill-height flex-column max-height-fill">
    <header
      v-if="step !== null"
      class="flex-grow-0 flex-shrink-0">
      <FcStepperStudyRequestBulk
        v-if="step !== null"
        v-model="step"
        :indices-intersections="indicesIntersections"
        :indices-midblocks="indicesMidblocks"
        class="mb-2" />

      <div class="px-5">
        <h2 class="display-3">Requesting New Counts</h2>
        <v-messages
          class="mt-2"
          :value="messagesTop"></v-messages>
      </div>

      <FcHeaderStudyRequestBulkLocations
        v-if="step === 1"
        key="header_1"
        v-model="indicesIntersectionsSelected"
        :indices="indicesIntersections"
        :locations="locations"
        :study-requests="studyRequests" />
      <FcHeaderStudyRequestBulkLocations
        v-else-if="step === 2"
        key="header_2"
        v-model="indicesMidblocksSelected"
        :indices="indicesMidblocks"
        :locations="locations"
        :study-requests="studyRequests" />
    </header>

    <v-divider v-if="step === 1 || step === 2"></v-divider>

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <FcStudyRequestBulkLocations
        v-if="step === 1"
        v-model="indicesIntersectionsSelected"
        :indices="indicesIntersections"
        :locations="locations"
        :locations-selection="locationsSelection"
        :study-requests="studyRequests"
        :study-summary-per-location-unfiltered="studySummaryPerLocationUnfiltered"
        :v="$v.studyRequests" />
      <FcStudyRequestBulkLocations
        v-else-if="step === 2"
        v-model="indicesMidblocksSelected"
        :indices="indicesMidblocks"
        :locations="locations"
        :locations-selection="locationsSelection"
        :study-requests="studyRequests"
        :study-summary-per-location-unfiltered="studySummaryPerLocationUnfiltered"
        :v="$v.studyRequests" />
      <FcStudyRequestBulkDetails
        v-else-if="step === 3"
        v-model="internalValue"
        :is-create="true"
        :v="$v.internalValue" />
      <FcStudyRequestBulkConfirm
        v-else-if="step === 4"
        :indices-intersections-selected="indicesIntersectionsSelected"
        :indices-midblocks-selected="indicesMidblocksSelected"
        :locations="locations"
        :locations-selection="locationsSelection"
        :study-request-bulk="internalValue"
        :study-requests="studyRequests"
        @remove-study="actionRemoveStudy" />
      <div v-else class="flex-grow-1 flex-shrink-1 text-center">
        <h2 class="fc-study-request-bulk-submitted display-3">
          New Count Request Submitted
        </h2>
        <p class="body-1 mt-6 mb-0">You have submitted a request for</p>
        <p class="title mt-2 mb-6">{{internalValue.name}}</p>
        <FcButton
          :disabled="loadingSubmit"
          :loading="loadingSubmit"
          type="secondary"
          @click="actionViewDetails">
          View Details
        </FcButton>
      </div>
    </div>

    <v-divider></v-divider>

    <footer class="flex-grow-0 flex-shrink-0">
      <div class="align-center d-flex px-3 py-2">
        <FcButton
          v-if="step !== null && step > 1"
          type="tertiary"
          @click="$emit('action-navigate-back')">
          Quit
        </FcButton>

        <v-spacer></v-spacer>

        <FcButton
          v-if="step === 1 || (step === 2 && indicesIntersections.length === 0)"
          class="mr-2"
          type="tertiary"
          @click="$emit('action-navigate-back')">
          Cancel
        </FcButton>
        <FcButton
          v-else-if="step !== null"
          class="mr-2"
          type="tertiary"
          @click="actionBack">
          Back
        </FcButton>

        <FcButton
          v-if="step !== null && step < 4"
          :disabled="disabledNext"
          type="primary"
          @click="actionNext">
          Continue
        </FcButton>
        <FcButton
          v-else-if="step === 4"
          type="primary"
          :disabled="disabledNext"
          @click="actionSubmit">
          <span>Submit</span>
        </FcButton>
        <FcButton
          v-else
          type="primary"
          @click="$emit('action-navigate-back', true)">
          Close
        </FcButton>
      </div>
    </footer>
  </section>
</template>

<script>
import { mapActions, mapMutations } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import { CentrelineType } from '@/lib/Constants';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';
import {
  REQUEST_STUDY_TIME_TO_FULFILL,
} from '@/lib/i18n/Strings';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import ValidationsStudyRequestBulk from '@/lib/validation/ValidationsStudyRequestBulk';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcHeaderStudyRequestBulkLocations
  from '@/web/components/requests/FcHeaderStudyRequestBulkLocations.vue';
import FcStepperStudyRequestBulk from '@/web/components/requests/FcStepperStudyRequestBulk.vue';
import FcStudyRequestBulkConfirm
  from '@/web/components/requests/FcStudyRequestBulkConfirm.vue';
import FcStudyRequestBulkDetails
  from '@/web/components/requests/FcStudyRequestBulkDetails.vue';
import FcStudyRequestBulkLocations
  from '@/web/components/requests/FcStudyRequestBulkLocations.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

function cardStudyRequestInvalid(v) {
  return v.daysOfWeek.$invalid
    || v.duration.$invalid
    || v.hours.$invalid
    || v.notes.$invalid
    || v.studyType.$invalid;
}

export default {
  name: 'FcCreateStudyRequestBulk',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcHeaderStudyRequestBulkLocations,
    FcStepperStudyRequestBulk,
    FcStudyRequestBulkConfirm,
    FcStudyRequestBulkDetails,
    FcStudyRequestBulkLocations,
  },
  props: {
    locations: Array,
    locationsSelection: Object,
    studySummaryPerLocationUnfiltered: Array,
  },
  data() {
    const studyRequests = [...this.value.studyRequests];

    const indicesIntersections = [];
    const indicesMidblocks = [];
    this.locations.forEach((location, i) => {
      if (location.centrelineType === CentrelineType.INTERSECTION) {
        indicesIntersections.push(i);
      } else if (location.centrelineType === CentrelineType.SEGMENT) {
        indicesMidblocks.push(i);
      } else {
        throw new InvalidCentrelineTypeError(location.centrelineType);
      }
    });

    const indicesIntersectionsSelected = [...indicesIntersections];
    const indicesMidblocksSelected = [...indicesMidblocks];

    const step = indicesIntersections.length > 0 ? 1 : 2;
    return {
      indicesIntersections,
      indicesIntersectionsSelected,
      indicesMidblocks,
      indicesMidblocksSelected,
      loadingSubmit: false,
      step,
      studyRequests,
    };
  },
  computed: {
    disabledNext() {
      if (this.step === 1) {
        return this.indicesIntersectionsSelected.some((i) => {
          const v = this.$v.studyRequests.$each[i];
          return cardStudyRequestInvalid(v);
        });
      }
      if (this.step === 2) {
        if (this.indicesSelected.length === 0) {
          return true;
        }
        return this.indicesSelected.some((i) => {
          const v = this.$v.studyRequests.$each[i];
          return cardStudyRequestInvalid(v);
        });
      }
      if (this.step === 3 || this.step === 4) {
        return this.$v.internalValue.$invalid;
      }
      return false;
    },
    indicesDeselected() {
      const indicesDeselected = [];
      const n = this.locations.length;
      for (let i = 0; i < n; i++) {
        if (!this.indicesSelected.includes(i)) {
          indicesDeselected.push(i);
        }
      }
      return indicesDeselected;
    },
    indicesSelected() {
      const indicesSelected = [
        ...this.indicesIntersectionsSelected,
        ...this.indicesMidblocksSelected,
      ];
      return ArrayUtils.sortBy(indicesSelected, i => i);
    },
    messagesTop() {
      if (this.step === 1) {
        const k = this.indicesIntersectionsSelected.length;
        const n = this.indicesIntersections.length;
        const subtitle = `${k} / ${n} selected`;
        return [`Select intersections for this study request \u2022 ${subtitle}`];
      }
      if (this.step === 2) {
        const k = this.indicesMidblocksSelected.length;
        const n = this.indicesMidblocks.length;
        const subtitle = `${k} / ${n} selected`;
        return [`Select midblocks for this study request \u2022 ${subtitle}`];
      }
      if (this.step === 3) {
        return [REQUEST_STUDY_TIME_TO_FULFILL.text];
      }
      if (this.step === 4) {
        return ['Let\'s make sure all the details are correct.'];
      }
      return [];
    },
    studyRequestsSelected() {
      return this.indicesSelected.map(i => this.studyRequests[i]);
    },
  },
  validations: {
    internalValue: ValidationsStudyRequestBulk,
    studyRequests: {
      $each: ValidationsStudyRequest,
    },
  },
  watch: {
    indicesDeselected() {
      this.setLocationsIndicesDeselected(this.indicesDeselected);
    },
    studyRequestsSelected() {
      this.internalValue.studyRequests = this.studyRequestsSelected;
    },
  },
  created() {
    this.setLocationsIndicesDeselected([]);
  },
  beforeDestroy() {
    this.setLocationsIndicesDeselected([]);
  },
  methods: {
    actionBack() {
      if (this.step === 3 && this.indicesMidblocks.length === 0) {
        this.step = 1;
      } else {
        this.step -= 1;
      }
    },
    actionNext() {
      if (this.step === 1 && this.indicesMidblocks.length === 0) {
        this.step = 3;
      } else {
        this.step += 1;
      }
    },
    actionRemoveStudy(i) {
      let j = this.indicesIntersectionsSelected.indexOf(i);
      if (j !== -1) {
        this.indicesIntersectionsSelected.splice(j, 1);
      } else {
        j = this.indicesMidblocksSelected.indexOf(i);
        if (j !== -1) {
          this.indicesMidblocksSelected.splice(j, 1);
        }
      }
    },
    async actionSubmit() {
      this.loadingSubmit = true;
      this.step = null;

      const studyRequestBulk = await this.saveStudyRequestBulk(this.internalValue);
      this.internalValue = studyRequestBulk;

      this.setToastInfo('Your new count request has been submitted.');
      this.loadingSubmit = false;
    },
    actionViewDetails() {
      if (this.loadingSubmit) {
        return;
      }
      this.$emit('action-view-details');
    },
    ...mapMutations(['setLocationsIndicesDeselected', 'setToastInfo']),
    ...mapActions(['saveStudyRequestBulk']),
  },
};
</script>

<style lang="scss">
.fc-study-request-bulk-submitted {
  margin-top: 200px;
}
</style>
