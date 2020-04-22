<template>
  <div class="pl-5">
    <section class="pr-5">
      <v-row class="mt-1 mb-2">
        <v-col class="pb-0" cols="12">
          <div class="subtitle-1">Status</div>
          <FcStatusStudyRequest
            class="mt-2"
            :study-request="studyRequest"
            :study-request-changes="studyRequestChanges" />
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Requester</div>
          <div class="mt-1 display-1">
            <span
              v-if="studyRequestUsers.has(studyRequest.userId)">
              {{studyRequestUsers.get(studyRequest.userId).uniqueName}}
            </span>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Service Request Number</div>
          <div class="mt-1 display-1">
            <span v-if="studyRequest.serviceRequestId">
              {{studyRequest.serviceRequestId}}
            </span>
            <span v-else>None</span>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Reasons</div>
          <div
            v-for="(reason, i) in studyRequest.reasons"
            :key="i"
            class="mt-1 display-1">
            {{reason.text}}
          </div>
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Due Date</div>
          <div class="mt-1 display-1">
            {{studyRequest.dueDate | date}}
          </div>
          <div
            v-if="studyRequest.urgent"
            class="align-center d-flex mt-1">
            <v-icon color="warning" left>mdi-clipboard-alert</v-icon>
            <v-messages
              :value="['This request has been marked as urgent.']"></v-messages>
          </div>
          <v-messages
            v-else
            class="mt-1"
            :value="['Standard times to request counts are 2-3 months.']"></v-messages>
        </v-col>
        <v-col
          v-if="studyRequest.urgent"
          cols="6">
          <div class="subtitle-1">Additional Information</div>
          <div class="mt-1 display-1">
            <span v-if="studyRequest.urgentReason">
              {{studyRequest.urgentReason}}
            </span>
            <span v-else>None</span>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Informed Staff</div>
          <div class="mt-1 display-1">
            <span v-if="studyRequest.ccEmails.length === 0">None</span>
            <div
              v-for="(ccEmail, i) in studyRequest.ccEmails"
              :key="i">
              {{ccEmail}}
            </div>
          </div>
        </v-col>
      </v-row>
    </section>

    <v-divider></v-divider>

    <section class="pr-5">
      <h2 class="headline mt-5">{{studyRequest.studyType.label}}</h2>
      <v-row class="mt-2 mb-6">
        <v-col cols="6">
          <div class="subtitle-1">Study Days</div>
          <div class="mt-1 display-1">
            {{studyRequest.daysOfWeek | daysOfWeek}}
          </div>
          <v-messages
            class="mt-1"
            :value="messagesDaysOfWeek"></v-messages>
        </v-col>
        <v-col cols="6">
          <template v-if="studyRequest.studyType.automatic">
            <div class="subtitle-1">Study Duration</div>
            <div class="mt-1 display-1">
              {{studyRequest.duration | durationHuman}}
            </div>
            <v-messages
              class="mt-1"
              :value="[studyRequest.duration + ' hours']"></v-messages>
          </template>
          <template v-else>
            <div class="subtitle-1">Study Hours</div>
            <div class="mt-1 display-1">
              {{studyRequest.hours.description}}
            </div>
            <v-messages
              class="mt-1"
              :value="[studyRequest.hours.hint]"></v-messages>
          </template>
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Additional Information</div>
          <div class="mt-1 display-1">
            <span v-if="studyRequest.notes">{{studyRequest.notes}}</span>
            <span v-else>None</span>
          </div>
        </v-col>
      </v-row>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { numConsecutiveDaysOfWeek } from '@/lib/validation/ValidationsStudyRequest';
import FcStatusStudyRequest from '@/web/components/FcStatusStudyRequest.vue';

export default {
  name: 'FcSummaryStudyRequest',
  components: {
    FcStatusStudyRequest,
  },
  props: {
    studyRequest: Object,
    studyRequestChanges: Array,
    studyRequestUsers: Map,
  },
  computed: {
    messagesDaysOfWeek() {
      const { daysOfWeek, duration, studyType } = this.studyRequest;
      if (studyType.automatic) {
        const k = numConsecutiveDaysOfWeek(daysOfWeek);
        const n = duration / 24;
        if (k === n) {
          return [];
        }
        if (n === 1) {
          return ['The study will be performed on one of these days.'];
        }
        return [`The study will be performed across ${n} consecutive days.`];
      }
      if (daysOfWeek.length === 1) {
        return [];
      }
      return ['The study will be performed on one of these days.'];
    },
    ...mapState(['auth']),
  },
};
</script>
