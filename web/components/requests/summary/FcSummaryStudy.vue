<template>
  <v-card
    outlined
    tag="section">
    <v-card-title class="d-flex">
      <img
        :alt="alt"
        class="mr-5"
        height="20"
        src="/icons/map/location-single.svg"
        width="16" />
      <h4 class="headline font-weight-bold">
        <span>{{study.studyType.label}}</span>
        <span v-if="study.studyType.other">
          ({{study.studyTypeOther.trim()}})
        </span>
      </h4>
    </v-card-title>

    <v-card-text class="default--text">
      <div class="mx-9">
        <SingleCollectionDayFields v-if="isSingleDayStudy" :study="study" />
        <MultipleCollectionDaysFields v-else :study="study" />
        <v-row>
          <v-col cols="12">
            <dt class="subtitle-1">Collection Notes</dt>
            <dd class="mt-1 display-1">
              <span v-if="study.notes">{{study.notes}}</span>
              <span v-else>None</span>
            </dd>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from 'vuex';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import SingleCollectionDayFields from '@/web/components/requests/summary/SingleCollectionDayFields.vue';
import MultipleCollectionDaysFields from '@/web/components/requests/summary/MultipleCollectionDaysFields.vue';

export default {
  name: 'FcSummaryStudy',
  props: {
    location: Object,
    study: Object,
  },
  components: {
    SingleCollectionDayFields,
    MultipleCollectionDaysFields,
  },
  computed: {
    alt() {
      const description = getLocationsSelectionDescription(this.locationsSelection);
      return `Study Location: ${description}`;
    },
    isSingleDayStudy() {
      return !this.study.studyType.isMultiDay;
    },
    ...mapState(['locationsSelection']),
  },
};
</script>
