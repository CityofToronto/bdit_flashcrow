<template>
  <section>
    <fieldset>
      <legend class="display-2 pt-4">
        <span v-if="isCreate">New</span>
        Project Details
      </legend>

      <div class="mt-4">
        <v-row>
          <v-col cols="8">
            <v-text-field
              ref="autofocus"
              autofocus
              dense
              v-model="v.name.$model"
              :error-messages="errorOnSubmit ? errorMessagesName : []"
              label="Project Name (required)"
              :messages="['The name of the project']"
              outlined>
            </v-text-field>
          </v-col>
        </v-row>
      </div>

      <div>
        <v-row>
          <v-col cols="8">
            <FcInputTextArray
              v-model="v.ccEmails.$model"
              :error-messages="errorOnSubmit ? errorMessagesCcEmails : []"
              label="Staff Subscribed"
              placeholder="Enter a @toronto.ca email address"
              messages="Staff who should be notified when the data is ready"
              :optional="true" />
          </v-col>
        </v-row>
      </div>

      <div class="mt-4 project-notes">
        <FcTextarea
          v-model="v.notes.$model"
          class="mt-3"
          label="Project Description"
          messages="A concise overview of the purpose and/or goals of the project"
          :rows="2"
          :optional="true"
          @blur="v.notes.$touch()" />
      </div>
    </fieldset>
  </section>
</template>

<script>
import { OPTIONAL } from '@/lib/i18n/Strings';
import FcInputTextArray from '@/web/components/inputs/FcInputTextArray.vue';
import FcTextarea from '@/web/components/inputs/FcTextarea.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkDetails',
  mixins: [
    FcMixinInputAutofocus,
    FcMixinVModelProxy(Object),
  ],
  components: {
    FcInputTextArray,
    FcTextarea,
  },
  props: {
    isCreate: Boolean,
    v: Object,
    errorOnSubmit: Boolean,
  },
  data() {
    return {
      OPTIONAL,
    };
  },
  computed: {
    errorMessagesCcEmails() {
      const errors = [];
      this.v.ccEmails.$model.forEach((_, i) => {
        if (!this.v.ccEmails.$each[i].$dirty) {
          return;
        }
        if (!this.v.ccEmails.$each[i].required) {
          errors.push('Please enter a value');
        }
        if (!this.v.ccEmails.$each[i].torontoInternal) {
          errors.push('Please enter a valid @toronto.ca email address');
        }
      });
      return errors;
    },
    errorMessagesName() {
      const errors = [];
      if (!this.v.name.required) {
        errors.push('Please enter a name for this project');
      }
      return errors;
    },
  },
};
</script>

<style>
  .project-notes textarea {
    margin: 20px 0 15px 0 !important;
    line-height: 1.4rem;
  }
</style>
