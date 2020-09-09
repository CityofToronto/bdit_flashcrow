<template>
  <section class="d-flex fill-height flex-column max-height-fill">
    <header
      v-if="step !== null"
      class="flex-grow-0 flex-shrink-0">
      <FcStepperStudyRequestBulk
        v-if="step !== null"
        v-model="step"
        class="mb-2" />

      <div class="px-5">
        <h2 class="display-3">Requesting New Counts</h2>
        <v-messages
          class="mt-2"
          :value="attrsMessagesTop"></v-messages>
      </div>

      <FcHeaderStudyRequestBulkLocations
        v-if="step === 1"
        v-model="indicesIntersectionsSelected"
        class="mt-6"
        :indices="indicesIntersections"
        :study-requests="studyRequests"
        title="Select Intersections" />
      <FcHeaderStudyRequestBulkLocations
        v-else-if="step === 2"
        v-model="indicesMidblocksSelected"
        class="mt-6"
        :indices="indicesMidblocks"
        :study-requests="studyRequests"
        title="Select Midblocks" />
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
        :v="$v.studyRequests" />
      <FcStudyRequestBulkLocations
        v-else-if="step === 2"
        v-model="indicesMidblocksSelected"
        :indices="indicesMidblocks"
        :locations="locations"
        :locations-selection="locationsSelection"
        :study-requests="studyRequests"
        :v="$v.studyRequests" />
      <FcStudyRequestBulkDetails
        v-else-if="step === 3"
        v-model="internalValue" />
      <FcStudyRequestBulkConfirm
        v-else-if="step === 4"
        :indices-intersections-selected="indicesIntersectionsSelected"
        :indices-midblocks-selected="indicesMidblocksSelected"
        :locations="locations"
        :locations-selection="locationsSelection"
        :study-request-bulk="internalValue"
        @remove-study="actionRemoveStudy" />
      <div v-else class="flex-grow-1 flex-shrink-1 text-center">
        <h2 class="fc-study-request-bulk-submitted display-3">
          New Count Request Submitted
        </h2>
        <p class="body-1 mt-6 mb-0">You have submitted a request for</p>
        <p class="title mt-2 mb-6">Don Mills Corridor</p>
        <FcButton
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
          v-if="step === 1"
          class="mr-2"
          type="tertiary"
          @click="$emit('action-navigate-back')">
          Cancel
        </FcButton>
        <FcButton
          v-else-if="step !== null"
          class="mr-2"
          type="tertiary"
          @click="step -= 1">
          Back
        </FcButton>

        <FcButton
          v-if="step !== null && step < 4"
          :disabled="disabledNext"
          type="primary"
          @click="step += 1">
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
  return v.studyType.$invalid
    || v.daysOfWeek.$invalid
    || v.duration.$invalid
    || v.notes.$invalid;
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
    return {
      indicesIntersections,
      indicesIntersectionsSelected,
      indicesMidblocks,
      indicesMidblocksSelected,
      step: 1,
      studyRequests,
    };
  },
  computed: {
    attrsMessagesTop() {
      if (this.step === 1) {
        return ['Select the intersections to be included in this study request.'];
      }
      if (this.step === 2) {
        return ['Select the midblocks to be included in this study request.'];
      }
      if (this.step === 3) {
        return [REQUEST_STUDY_TIME_TO_FULFILL.text];
      }
      if (this.step === 4) {
        return ['Let\'s make sure all the details are correct.'];
      }
      return [];
    },
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
    indicesSelected() {
      const indicesSelected = [
        ...this.indicesIntersectionsSelected,
        ...this.indicesMidblocksSelected,
      ];
      return ArrayUtils.sortBy(indicesSelected, i => i);
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
    studyRequestsSelected() {
      this.internalValue.studyRequests = this.studyRequestsSelected;
    },
  },
  methods: {
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
    actionSubmit() {
      // TODO: actually save
      this.step = null;
    },
    actionViewDetails() {
      /* eslint-disable-next-line no-alert */
      window.alert('Coming Soon!');
    },
  },
};
</script>

<style lang="scss">
.fc-study-request-bulk-submitted {
  margin-top: 200px;
}
</style>
