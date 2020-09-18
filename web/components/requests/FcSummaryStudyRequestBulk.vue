<template>
  <div>
    <section class="pr-5">
      <v-row class="mt-1 mb-2">
        <v-col cols="6">
          <div class="subtitle-1">Requester</div>
          <div class="mt-1 display-1">
            <span v-if="requestedBy !== null">
              {{requestedBy | username}}
            </span>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Submitted</div>
          <div class="mt-1 display-1">
            {{studyRequestBulk.createdAt | date}}
          </div>
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Due Date</div>
          <div class="mt-1 display-1">
            {{studyRequestBulk.dueDate | date}}
          </div>
        </v-col>
        <v-col cols="6">
          <div class="subtitle-1">Reason</div>
          <div class="mt-1 display-1">
            {{studyRequestBulk.reason.text}}
          </div>
        </v-col>
        <v-col cols="12">
          <div class="subtitle-1">Additional Information</div>
          <div class="mt-1 display-1">
            <span v-if="studyRequestBulk.urgentReason">{{studyRequestBulk.urgentReason}}</span>
            <span v-else>None</span>
          </div>
        </v-col>
      </v-row>
    </section>
  </div>
</template>

<script>
export default {
  name: 'FcSummaryStudyRequestBulk',
  props: {
    studyRequestBulk: Object,
    studyRequestUsers: Map,
  },
  computed: {
    requestedBy() {
      const { studyRequestBulk, studyRequestUsers } = this;
      if (!studyRequestUsers.has(studyRequestBulk.userId)) {
        return null;
      }
      return studyRequestUsers.get(studyRequestBulk.userId);
    },
  },
};
</script>
