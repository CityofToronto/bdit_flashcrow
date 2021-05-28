<template>
  <v-card
    class="fc-card-study-request"
    :class="{ selected }"
    outlined>
    <v-card-title class="align-start pb-2">
      <FcIconLocationMulti
        class="mr-3"
        :location-index="index"
        :selected="selected" />
      <div class="fc-card-study-request-title">
        <h3 class="headline mb-1">{{location.description}}</h3>
        <FcTextMostRecent
          v-if="studyRequest.studyType !== null"
          :study="null" />
      </div>
    </v-card-title>

    <v-card-text class="pb-0">
      <fieldset>
        <legend class="sr-only">Study Type for Request</legend>

        <v-row class="mt-1">
          <v-col class="my-0 py-2" cols="8">
            <FcStudyRequestStudyType
              dense
              :location="location"
              :v="v" />
          </v-col>
          <template v-if="studyRequest.studyType !== null">
            <v-col class="my-0 py-2" cols="6">
              <FcStudyRequestDaysOfWeek
                dense
                :v="v" />
            </v-col>
            <v-col class="my-0 py-2" cols="6">
              <FcStudyRequestDuration
                v-if="studyRequest.studyType.automatic"
                dense
                :v="v" />
              <FcStudyRequestHours
                v-else
                dense
                :v="v" />
            </v-col>
          </template>
          <v-col class="my-0 pt-0" cols="12">
            <FcStudyRequestNotes
              :v="v" />
          </v-col>
        </v-row>
      </fieldset>
    </v-card-text>
  </v-card>
</template>

<script>
import { StudyHours, StudyType } from '@/lib/Constants';
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';
import FcStudyRequestDaysOfWeek
  from '@/web/components/requests/fields/FcStudyRequestDaysOfWeek.vue';
import FcStudyRequestDuration from '@/web/components/requests/fields/FcStudyRequestDuration.vue';
import FcStudyRequestHours from '@/web/components/requests/fields/FcStudyRequestHours.vue';
import FcStudyRequestNotes from '@/web/components/requests/fields/FcStudyRequestNotes.vue';
import FcStudyRequestStudyType from '@/web/components/requests/fields/FcStudyRequestStudyType.vue';

export default {
  name: 'FcCardStudyRequest',
  components: {
    FcIconLocationMulti,
    FcStudyRequestDaysOfWeek,
    FcStudyRequestDuration,
    FcStudyRequestHours,
    FcStudyRequestNotes,
    FcStudyRequestStudyType,
    FcTextMostRecent,
  },
  props: {
    index: Number,
    location: Object,
    selected: Boolean,
    studyRequest: Object,
    v: Object,
  },
  data() {
    return {
      StudyHours,
      StudyType,
    };
  },
};
</script>

<style lang="scss">
.fc-card-study-request.theme--light.v-sheet {
  border: 2px solid var(--v-border-base);
  &.selected {
    border: 2px solid var(--v-primary-base);
  }
}
</style>
