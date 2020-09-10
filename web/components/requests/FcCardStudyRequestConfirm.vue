<template>
  <v-card
    class="fc-card-study-request-confirm"
    flat>
    <v-card-title class="align-start pb-2">
      <FcIconLocationMulti
        class="mr-5"
        v-bind="iconProps" />
      <div class="fc-card-study-request-title">
        {{location.description}}
      </div>
    </v-card-title>
    <v-card-text class="pb-0">
      <div class="mx-9">
        <v-row>
          <v-col class="py-2" cols="6">
            <div class="subtitle-1">
              Study Type
            </div>
            <div class="mt-1 display-1">
              {{studyRequest.studyType.label}}
            </div>
          </v-col>
          <v-col class="py-2" cols="6">
            <div class="subtitle-1">
              Days
            </div>
            <div class="mt-1 display-1">
              {{studyRequest.daysOfWeek | daysOfWeek}}
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-2" cols="6">
            <template v-if="studyRequest.studyType.automatic">
              <div class="subtitle-1">
                Duration
              </div>
              <div class="mt-1 display-1">
                {{studyRequest.duration | durationHuman}}
              </div>
              <v-messages
                class="mt-1"
                :value="[studyRequest.duration + ' hours']"></v-messages>
            </template>
            <template v-else>
              <div class="subtitle-1">
                Hours
              </div>
              <div class="mt-1 display-1">
                {{studyRequest.hours.description}}
              </div>
            </template>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="py-2" cols="12">
            <div class="subtitle-1">
              Additional Information
            </div>
            <div class="mt-1 display-1">
              <span v-if="studyRequest.notes">{{studyRequest.notes}}</span>
              <span v-else>None</span>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';

export default {
  name: 'FcCardStudyRequestConfirm',
  components: {
    FcIconLocationMulti,
  },
  props: {
    iconProps: Object,
    location: Object,
    studyRequest: Object,
  },
};
</script>

<style lang="scss">
.fc-card-study-request-confirm.theme--light.v-sheet {
  border: 0;
}
</style>
