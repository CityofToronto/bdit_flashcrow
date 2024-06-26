<template>
  <v-card
    @mouseover="addHoverLayer(index, $event)"
    @mouseleave="addHoverLayer(null, $event)"
    class="fc-card-study-request pb-2 mb-3"
    :class="{ selected }"
    outlined
    :elevation="elevation">
    <div>
    <v-card-title class="align-start pb-2">
      <FcIconLocationSingle
        class="mr-3"
        :index="index"
        />
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
          :study="this.getMostRecent(studyRequest)" />
      </div>
      <v-spacer></v-spacer>
      <span class="font-weight-regular secondary--text">{{locationType}}</span>
    </v-card-title>

    <v-card-text class="pb-0">
      <StudyRequestForm
      class='study-request-form' :v="v" :location="location"
      :index="index"/>
    </v-card-text>
  </div>
  </v-card>
</template>

<script>
import { CentrelineType, StudyHours, StudyType } from '@/lib/Constants';
import FcTextMostRecent from '@/web/components/data/FcTextMostRecent.vue';
import FcIconLocationSingle from '@/web/components/location/FcIconLocationSingle.vue';
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
    FcIconLocationSingle,
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
      lastMouseEnterSource: null,
      elevation: 0,
      prevCard: null,
      currentCard: null,
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
  watch: {
    locationType() {
      let studyType;
      if (this.location.centrelineType === CentrelineType.INTERSECTION) {
        studyType = StudyType.TMC;
      } else {
        studyType = StudyType.ATR_SVC;
      }
      this.v.studyType.$model = studyType;
    },
  },
  methods: {
    async addHoverLayer(index, event) {
      const {
        top,
        bottom,
        left,
        right,
      } = this.$el.getBoundingClientRect();
      if (event.pageX > left
          && event.pageX < right
          && event.pageY < bottom
          && event.pageY > top
          && index !== null) {
        this.elevation = 5;
        this.currentCard = index;
        this.addHoveredStudyIndex(index);
      } else if (index === null) {
        this.previousCard = this.currentCard;
        // eslint-disable-next-line no-underscore-dangle
        if (event.toElement?._prevClass === 'v-list v-select-list v-sheet theme--light v-list--dense theme--light') {
          return;
        }
        this.addHoveredStudyIndex(index);
        this.elevation = 0;
      }
    },
    getMostRecent(request) {
      if (request.studyType === StudyType.ATR_SVC) {
        return this.mostRecent.get(StudyType.ATR_SVC)
        || this.mostRecent.get(StudyType.ATR_SPEED_VOLUME);
      }
      return this.mostRecent.get(request.studyType);
    },
    ...mapActions('editRequests', [
      'addHoveredStudyIndex',
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
