<template>
  <section class="pa-5">
    <div class="mt-1">
      <h3 class="headline">Create Request Name</h3>
      <v-row>
        <v-col cols="8">
          <v-text-field
            ref="autofocus"
            v-model="v.name.$model"
            :error-messages="errorMessagesName"
            label="Set Name for Bulk Request"
            :messages="['Required']"
            outlined>
          </v-text-field>
        </v-col>
      </v-row>
    </div>

    <div class="mt-1">
      <h3 class="headline">Reason for Request</h3>
      <v-row>
        <v-col cols="8">
          <FcStudyRequestReason :v="v" />
        </v-col>
      </v-row>
    </div>

    <FcStudyRequestUrgent
      class="mt-4"
      :is-create="true"
      :v="v" />
  </section>
</template>

<script>
import { StudyRequestReason } from '@/lib/Constants';
import { OPTIONAL } from '@/lib/i18n/Strings';
import FcStudyRequestReason from '@/web/components/requests/fields/FcStudyRequestReason.vue';
import FcStudyRequestUrgent from '@/web/components/requests/fields/FcStudyRequestUrgent.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

function mapWatchers(keys) {
  const watchers = {};
  keys.forEach((key) => {
    watchers[`internalValue.${key}`] = {
      handler() {
        const { studyRequests, [key]: value } = this.internalValue;
        const n = studyRequests.length;
        for (let i = 0; i < n; i++) {
          studyRequests[i][key] = value;
        }
      },
      immediate: true,
    };
  });
  return watchers;
}

export default {
  name: 'FcStudyRequestBulkDetails',
  mixins: [
    FcMixinInputAutofocus,
    FcMixinVModelProxy(Object),
  ],
  components: {
    FcStudyRequestReason,
    FcStudyRequestUrgent,
  },
  props: {
    isCreate: Boolean,
    v: Object,
  },
  data() {
    return {
      OPTIONAL,
      StudyRequestReason,
    };
  },
  computed: {
    errorMessagesName() {
      const errors = [];
      if (!this.v.name.required) {
        errors.push('Please enter a name for this request.');
      }
      return errors;
    },
  },
  watch: {
    ...mapWatchers([
      'ccEmails',
      'dueDate',
      'estimatedDeliveryDate',
      'reason',
      'reasonOther',
      'urgent',
      'urgentReason',
    ]),
  },
};
</script>
