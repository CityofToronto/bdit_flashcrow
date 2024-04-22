<template>
  <v-card @mouseenter="test(index)"
    @mouseleave="test(null)"
    class="fc-card-study-request pb-2 mb-3"
    :class="{ selected }"
    outlined>
    <v-card-title class="align-start pb-2">
      <FcIconLocationMulti
        class="mr-3"
        :location-index="index"
        :selected="selected" />
      <div class="fc-card-study-request-title">
        <h3 class="headline mb-1">{{location.description}}</h3>
        <FcButtonAria
          aria-label="Change location"
          button-class="mr-2"
          right
          type="tertiary"
          @click="$emit('action-edit-location')">
          <v-icon small>mdi-pencil</v-icon>
        </FcButtonAria>
        <FcTextMostRecent
          v-if="studyRequest.studyType !== null"
          :study="mostRecent.get(studyRequest.studyType)" />
      </div>
      <v-spacer></v-spacer>
      <span class="font-weight-regular secondary--text">{{locationType}}</span>
    </v-card-title>

    <v-card-text class="pb-0">
      <StudyRequestForm class='study-request-form' :v="v" :location="location" />
    </v-card-text>
  </v-card>
</template>

<script>
import { CentrelineType, StudyHours, StudyType } from '@/lib/Constants';
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';
import StudyRequestForm from '@/web/components/requests/StudyRequestForm.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import {
  mapActions,
} from 'vuex';

export default {
  name: 'FcCardStudyRequest',
  components: {
    FcButtonAria,
    StudyRequestForm,
    FcIconLocationMulti,
    FcTextMostRecent,
  },
  props: {
    index: Number,
    location: Object,
    mostRecent: Map,
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
  computed: {
    locationType() {
      const { centrelineType } = this.location;
      if (centrelineType === CentrelineType.INTERSECTION) {
        return 'Intersection';
      }
      return 'Midblock';
    },
  },
  methods: {
    async test(index) {
      this.addHoveredStudyRequest(index);
    },
    ...mapActions('editRequests', [
      'addHoveredStudyRequest',
    ]),
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

.fc-card-study-request-title {
  .headline {
    display: inline-block;
  }
  .fc-text-most-recent {
    display: block;
    width: fit-content;
  }
  .fc-button {
    position: relative;
    bottom: 2px;
    left: 8px;
    min-width: fit-content !important;
    height: fit-content !important;
    padding: 0 !important;
  }
}
</style>
