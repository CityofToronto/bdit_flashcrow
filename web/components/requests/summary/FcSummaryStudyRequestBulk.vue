<template>
  <section>
    <v-row class="mt-1 mb-2" tag="dl">
      <v-col cols="12">
        <dt class="subtitle-1">Project Description</dt>
        <dd class="mt-1 display-1">
          <span v-if="studyRequestBulk.notes">
            {{studyRequestBulk.notes}}
          </span>
          <span v-else>None</span>
        </dd>
      </v-col>
      <v-col cols="6">
        <template v-if="!isCreate">
          <dt class="subtitle-1">Staff Subscribed</dt>
          <dd class="mt-1 display-1">
            <v-chip
              v-for="(ccEmail, i) in studyRequestBulk.ccEmails"
              :key="i"
              class="mr-2"
              color="secondary"
              label
              small>
              <span>{{ccEmail}}</span>
            </v-chip>
            <span v-if="studyRequestBulk.ccEmails.length === 0">
              None
            </span>
          </dd>
        </template>
      </v-col>
    </v-row>
  </section>
</template>

<script>
import { REQUEST_STUDY_TIME_TO_FULFILL_SHORT } from '@/lib/i18n/Strings';

export default {
  name: 'FcSummaryStudyRequestBulk',
  props: {
    isCreate: {
      type: Boolean,
      default: false,
    },
    studyRequestBulk: Object,
  },
  data() {
    return {
      REQUEST_STUDY_TIME_TO_FULFILL_SHORT,
    };
  },
};
</script>
