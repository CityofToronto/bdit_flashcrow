<template>
  <section class="d-flex flex-column min-height-fill max-height-fill">
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <section class="pa-5">
        <v-messages
          :value="[REQUEST_STUDY_TIME_TO_FULFILL.text]"></v-messages>

        <div class="mt-4">
          <h2 class="headline">Study Type</h2>
          <v-row>
            <v-col cols="8">
              <FcStudyRequestStudyType :v="$v.internalValue" />
            </v-col>
          </v-row>
        </div>

        <div class="mt-4">
          <h2 class="headline">Reason for Request</h2>
          <v-row>
            <v-col cols="8">
              <FcStudyRequestReason :v="$v.internalValue" />
            </v-col>
          </v-row>
        </div>
      </section>
      <template v-if="internalValue.studyType">
        <v-divider></v-divider>

        <section class="pa-5 shading">
          <h2 class="display-1">{{internalValue.studyType.label}}</h2>

          <div class="mt-4">
            <h3 class="headline">Study Days</h3>
            <v-row>
              <v-col cols="8">
                <FcStudyRequestDaysOfWeek :v="$v.internalValue" />
              </v-col>
            </v-row>
          </div>

          <div class="mt-4">
            <template v-if="internalValue.studyType.automatic">
              <h3 class="headline">Study Duration</h3>
              <v-row>
                <v-col cols="8">
                  <FcStudyRequestDuration :v="$v.internalValue" />
                </v-col>
              </v-row>
            </template>
            <template v-else>
              <h3 class="headline">Study Hours</h3>
              <v-row>
                <v-col cols="8">
                  <FcStudyRequestHours :v="$v.internalValue" />
                </v-col>
              </v-row>
            </template>
          </div>

          <FcStudyRequestNotes
            class="mt-4"
            :v="$v.internalValue" />
        </section>
      </template>

      <v-divider></v-divider>

      <section class="pa-5">
        <FcStudyRequestUrgent
          class="mt-4"
          :is-create="isCreate"
          :v="$v.internalValue" />
      </section>
    </section>

    <v-divider></v-divider>

    <footer class="flex-grow-0 flex-shrink-0">
      <div class="align-center d-flex px-3 py-2">
        <v-spacer></v-spacer>
        <FcButton
          class="mr-2"
          type="tertiary"
          @click="$emit('action-navigate-back')">
          Cancel
        </FcButton>
        <FcButton
          :disabled="$v.internalValue.$invalid"
          type="primary"
          @click="actionSubmit">
          <span v-if="isCreate">Submit</span>
          <span v-else>Save</span>
        </FcButton>
      </div>
    </footer>
  </section>
</template>

<script>
import { mapActions } from 'vuex';

import {
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import {
  OPTIONAL,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_TIME_TO_FULFILL,
} from '@/lib/i18n/Strings';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcStudyRequestDaysOfWeek
  from '@/web/components/requests/fields/FcStudyRequestDaysOfWeek.vue';
import FcStudyRequestDuration from '@/web/components/requests/fields/FcStudyRequestDuration.vue';
import FcStudyRequestHours from '@/web/components/requests/fields/FcStudyRequestHours.vue';
import FcStudyRequestNotes from '@/web/components/requests/fields/FcStudyRequestNotes.vue';
import FcStudyRequestReason from '@/web/components/requests/fields/FcStudyRequestReason.vue';
import FcStudyRequestStudyType from '@/web/components/requests/fields/FcStudyRequestStudyType.vue';
import FcStudyRequestUrgent from '@/web/components/requests/fields/FcStudyRequestUrgent.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDetailsStudyRequest',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcStudyRequestDaysOfWeek,
    FcStudyRequestDuration,
    FcStudyRequestHours,
    FcStudyRequestNotes,
    FcStudyRequestReason,
    FcStudyRequestStudyType,
    FcStudyRequestUrgent,
  },
  props: {
    isCreate: Boolean,
    location: Object,
  },
  data() {
    return {
      // CACHED DUE DATES
      dueDate: null,
      dueDateUrgent: null,
      // MESSAGES
      OPTIONAL,
      reasonOther: null,
      REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
      REQUEST_STUDY_PROVIDE_URGENT_REASON,
      REQUEST_STUDY_TIME_TO_FULFILL,
      StudyRequestReason,
      StudyType,
    };
  },
  validations: {
    internalValue: ValidationsStudyRequest,
  },
  methods: {
    actionSubmit() {
      this.saveStudyRequest(this.internalValue);
      this.$emit('action-navigate-back', true);
    },
    ...mapActions(['saveStudyRequest']),
  },
};
</script>
