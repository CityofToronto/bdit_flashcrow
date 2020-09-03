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
    </header>

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <FcStudyRequestBulkIntersections
        v-if="step === 1"
        v-model="internalValue"
        :locations="locations" />
      <FcStudyRequestBulkMidblocks
        v-else-if="step === 2"
        v-model="internalValue"
        :locations="locations" />
      <FcStudyRequestBulkDetails
        v-else-if="step === 3"
        v-model="internalValue" />
      <FcStudyRequestBulkConfirm
        v-else-if="step === 4"
        v-model="internalValue" />
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
          :disabled="false"
          type="primary"
          @click="step += 1">
          Continue
        </FcButton>
        <FcButton
          v-else-if="step === 4"
          type="primary"
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
import {
  REQUEST_STUDY_TIME_TO_FULFILL,
} from '@/lib/i18n/Strings';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcStepperStudyRequestBulk from '@/web/components/requests/FcStepperStudyRequestBulk.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDetailsStudyRequestBulk',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcStepperStudyRequestBulk,
  },
  props: {
    locations: Array,
  },
  data() {
    return {
      step: 1,
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
  },
  methods: {
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
