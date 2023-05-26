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
              v-model="v.name.$model"
              :error-messages="errorMessagesName"
              label="Set Name for Project"
              :messages="['Required']"
              outlined>
            </v-text-field>
          </v-col>
        </v-row>
      </div>

      <div class="mt-4">
        <v-row>
          <v-col cols="8">
            <FcInputTextArray
              v-model="v.ccEmails.$model"
              :error-messages="errorMessagesCcEmails"
              label="Staff Subscribed"
              :messages="messagesCcEmails" />
          </v-col>
        </v-row>
      </div>

      <div class="mt-4">
        <FcTextarea
          v-model="v.notes.$model"
          class="mt-3"
          label="Notes"
          :messages="messagesNotes"
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
          errors.push('Please enter a value.');
        }
        if (!this.v.ccEmails.$each[i].torontoInternal) {
          errors.push('Please enter a valid @toronto.ca email address.');
        }
      });
      return errors;
    },
    errorMessagesName() {
      const errors = [];
      if (!this.v.name.required) {
        errors.push('Please enter a name for this project.');
      }
      return errors;
    },
    messagesCcEmails() {
      return [OPTIONAL.text];
    },
    messagesNotes() {
      return [OPTIONAL.text];
    },
  },
};
</script>
