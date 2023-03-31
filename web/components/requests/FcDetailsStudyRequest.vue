<template>
  <section class="d-flex flex-column min-height-fill max-height-fill">

    <div class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <StudyRequestForm class="pa-5"
        :v="$v.internalValue" :location="location" />
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
import StudyRequestForm from '@/web/components/requests/StudyRequestForm.vue';
import { mapActions, mapMutations } from 'vuex';

import {
  StudyType,
} from '@/lib/Constants';
import {
  OPTIONAL,
  REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
  REQUEST_STUDY_PROVIDE_URGENT_REASON,
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_UPDATED,
} from '@/lib/i18n/Strings';
import ValidationsStudyRequest from '@/lib/validation/ValidationsStudyRequest';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcStudyRequestUrgent from '@/web/components/requests/fields/FcStudyRequestUrgent.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';
// eslint-disable-next-line import/extensions
import StudyRequestFormMixin from '@/web/components/requests/StudyRequestFormMixin.js';

export default {
  name: 'FcDetailsStudyRequest',
  mixins: [
    FcMixinInputAutofocus,
    FcMixinVModelProxy(Object),
    StudyRequestFormMixin,
  ],
  components: {
    FcButton,
    FcStudyRequestUrgent,
    StudyRequestForm,
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
      REQUEST_STUDY_PROVIDE_URGENT_DUE_DATE,
      REQUEST_STUDY_PROVIDE_URGENT_REASON,
      StudyType,
    };
  },
  validations: {
    internalValue: ValidationsStudyRequest,
  },
  methods: {
    async actionSubmit() {
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

      await this.sleep(500); // delay form submit so *urgent* input vals are added to store
      this.saveStudyRequest(this.internalValue);
      this.$emit('action-navigate-back', true);
    },
    ...mapMutations(['setDialog', 'setToastInfo']),
    ...mapActions(['saveStudyRequest']),
  },
};
</script>
