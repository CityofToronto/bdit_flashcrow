<template>
  <section class="d-flex flex-column min-height-fill max-height-fill">

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <fieldset class="pa-5">
        <legend class="display-2 pt-4">Study Type for Request</legend>
        <v-messages :value="[REQUEST_STUDY_TIME_TO_FULFILL.text]" />

        <div class="mt-4">
          <v-row>
            <v-col cols="8">
              <FcStudyRequestStudyType
                ref="autofocus"
                :location="location"
                :v="$v.internalValue" />
            </v-col>
          </v-row>
        </div>

        <template v-if="internalValue.studyType">
          <div class="mt-4">
            <v-row>
              <v-col cols="6">
                <FcStudyRequestDaysOfWeek :v="$v.internalValue" />
              </v-col>
              <v-col cols="6">
                <FcStudyRequestDuration
                  v-if="internalValue.studyType.automatic"
                  :v="$v.internalValue" />
                <FcStudyRequestHours
                  v-else
                  :v="$v.internalValue" />
              </v-col>
            </v-row>
          </div>

          <FcStudyRequestNotes
            class="mt-4"
            :v="$v.internalValue" />
        </template>
      </fieldset>

      <v-divider></v-divider>

      <FcStudyRequestUrgent
        class="pa-5"
        :is-create="isCreate"
        :v="$v.internalValue" />
    </div>

    <v-divider></v-divider>

    <footer class="flex-grow-0 flex-shrink-0 shading">
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
import { mapActions, mapMutations } from 'vuex';

import {
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import {
  OPTIONAL,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_TIME_TO_FULFILL,
  REQUEST_STUDY_UPDATED,
} from '@/lib/i18n/Strings';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcStudyRequestDaysOfWeek
  from '@/web/components/requests/fields/FcStudyRequestDaysOfWeek.vue';
import FcStudyRequestDuration from '@/web/components/requests/fields/FcStudyRequestDuration.vue';
import FcStudyRequestHours from '@/web/components/requests/fields/FcStudyRequestHours.vue';
import FcStudyRequestNotes from '@/web/components/requests/fields/FcStudyRequestNotes.vue';
import FcStudyRequestStudyType from '@/web/components/requests/fields/FcStudyRequestStudyType.vue';
import FcStudyRequestUrgent from '@/web/components/requests/fields/FcStudyRequestUrgent.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDetailsStudyRequest',
  mixins: [
    FcMixinInputAutofocus,
    FcMixinVModelProxy(Object),
  ],
  components: {
    FcButton,
    FcStudyRequestDaysOfWeek,
    FcStudyRequestDuration,
    FcStudyRequestHours,
    FcStudyRequestNotes,
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
      const { id, urgent } = this.internalValue;
      const update = id !== undefined;
      if (update) {
        this.setToastInfo(REQUEST_STUDY_UPDATED.text);
      } else if (urgent) {
        this.setDialog({
          dialog: 'AlertStudyRequestUrgent',
          dialogData: { update },
        });
      } else {
        this.setToastInfo(REQUEST_STUDY_SUBMITTED.text);
      }

      this.saveStudyRequest(this.internalValue);
      this.$emit('action-navigate-back', true);
    },
    ...mapMutations(['setDialog', 'setToastInfo']),
    ...mapActions(['saveStudyRequest']),
  },
};
</script>
