<template>
  <v-card
    class="fc-card-study-request-confirm"
    outlined>
    <v-card-title class="align-start pb-2">
      <FcIconLocationMulti
        class="mr-5"
        v-bind="iconProps" />
      <h3 class="headline">
        {{location.description}}
      </h3>
    </v-card-title>

    <v-card-text class="default--text">
      <div class="mx-9">
        <v-row class="mt-1" tag="dl">
          <v-col class="py-2" cols="6">
            <dt class="subtitle-1">
              Study Type
            </dt>
            <dd class="mt-1 display-1">
              {{studyRequest.studyType.label}}
              <span v-if="studyRequest.studyType.other">
                ({{studyRequest.studyTypeOther}})
              </span>
            </dd>
          </v-col>
          <v-col class="py-2" cols="6">
            <dt class="subtitle-1">
              Study Days
            </dt>
            <dd class="mt-1 display-1">
              {{studyRequest.daysOfWeek | daysOfWeek}}
            </dd>
          </v-col>
          <v-col class="py-2" cols="6">
            <template v-if="studyRequest.studyType.automatic">
              <dt class="subtitle-1">
                Study Duration
              </dt>
              <dd class="mt-1 display-1">
                {{studyRequest.duration | durationHuman}}
              </dd>
              <dd>
                <v-messages
                  class="mt-1"
                  :value="[studyRequest.duration + ' hours']" />
              </dd>
            </template>
            <template v-else>
              <dt class="subtitle-1">
                Study Hours
              </dt>
              <dd class="mt-1 display-1">
                {{studyRequest.hours.description}}
              </dd>
              <dd>
                <v-messages
                  class="mt-1"
                  :value="[studyRequest.hours.hint]" />
              </dd>
            </template>
          </v-col>
          <v-col class="py-2" cols="12">
            <dt class="subtitle-1">
              Notes
            </dt>
            <dd class="mt-1 display-1">
              <span v-if="studyRequest.notes">{{studyRequest.notes}}</span>
              <span v-else>None</span>
            </dd>
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
