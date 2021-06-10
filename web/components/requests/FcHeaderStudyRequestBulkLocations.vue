<template>
  <div class="mx-5">
    <div class="align-center d-flex">
      <v-checkbox
        v-model="selectAll"
        class="mr-2"
        :indeterminate="selectAll === null">
        <template v-slot:label>
          <span class="font-weight-medium">Select all</span>
          <FcTextNumberTotal
            class="ml-2"
            :k="internalValue.length"
            :n="studyRequests.length" />
        </template>
      </v-checkbox>
      <FcSelectEnum
        v-model="selectAllType"
        class="fc-select-all-type flex-grow-0 ml-2 mt-n1"
        dense
        hide-details
        label="Choose what to select"
        :of-type="SelectAllType"
        outlined />

      <v-spacer></v-spacer>

      <FcMenu
        :disabled="selectAll === false"
        :items="itemsStudyType"
        @action-menu="actionSetStudyType">
        <span>Study Type</span>
      </FcMenu>
      <FcMenu
        button-class="ml-2"
        :disabled="selectAll === false"
        :items="itemsDaysOfWeek"
        min-width="120"
        @action-menu="actionSetDaysOfWeek">
        <template v-slot:item="{ item }">
          <div class="align-center d-flex">
            <v-simple-checkbox
              class="mx-2"
              dense
              :indeterminate="item.selected === null"
              :value="item.selected"
              @click="actionSetDaysOfWeek(item)" />
            <span>{{item.text}}</span>
          </div>
        </template>
        <span>Days</span>
      </FcMenu>

      <FcMenu
        v-if="showDuration"
        button-class="ml-2"
        :items="itemsDuration"
        @action-menu="actionSetDuration">
        <span>Duration</span>
      </FcMenu>
      <FcMenu
        v-if="showHours"
        button-class="ml-2"
        :items="itemsHours"
        @action-menu="actionSetHours">
        <span>Hours</span>
      </FcMenu>
    </div>
  </div>
</template>

<script>
import { Ripple } from 'vuetify/lib/directives';
import { mapMutations } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import { Enum } from '@/lib/ClassUtils';
import { CentrelineType, StudyHours, StudyType } from '@/lib/Constants';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcMenu from '@/web/components/inputs/FcMenu.vue';
import FcTextNumberTotal from '@/web/components/data/FcTextNumberTotal.vue';
import FcSelectEnum from '@/web/components/inputs/FcSelectEnum.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

class SelectAllType extends Enum {}
SelectAllType.init({
  LOCATIONS: {
    centrelineTypes: [CentrelineType.INTERSECTION, CentrelineType.SEGMENT],
    text: 'Locations',
  },
  INTERSECTIONS: {
    centrelineTypes: [CentrelineType.INTERSECTION],
    text: 'Intersections',
  },
  MIDBLOCKS: {
    centrelineTypes: [CentrelineType.SEGMENT],
    text: 'Midblocks',
  },
});

export default {
  name: 'FcHeaderStudyRequestBulkLocations',
  mixins: [
    FcMixinVModelProxy(Array),
  ],
  directives: {
    Ripple,
  },
  components: {
    FcMenu,
    FcSelectEnum,
    FcTextNumberTotal,
  },
  props: {
    locations: Array,
    studyRequests: Array,
  },
  data() {
    const itemsDuration = [
      { text: '1 day', value: 24 },
      { text: '2 days', value: 48 },
      { text: '3 days', value: 72 },
      { text: '4 days', value: 96 },
      { text: '5 days', value: 120 },
      { text: '1 week', value: 168 },
    ];
    const itemsSelectAllType = SelectAllType.enumValues.map((value) => {
      const { text } = value;
      return { text, value };
    });
    return {
      itemsDuration,
      itemsSelectAllType,
      selectAllType: SelectAllType.LOCATIONS,
      SelectAllType,
    };
  },
  computed: {
    itemsDaysOfWeek() {
      return TimeFormatters.DAYS_OF_WEEK.map((text, value) => {
        const k = this.internalValue.length;
        const s = this.internalValue
          .filter(i => this.studyRequests[i].daysOfWeek.includes(value))
          .length;
        let selected = null;
        if (s === 0) {
          selected = false;
        } else if (s === k) {
          selected = true;
        }
        return { selected, text, value };
      });
    },
    itemsHours() {
      return StudyHours.enumValues.map((value) => {
        const { description } = value;
        return { text: description, value };
      });
    },
    itemsStudyType() {
      return this.locationsStudyTypes.map((studyType) => {
        const { label } = studyType;
        return { text: label, value: studyType };
      });
    },
    locationsStudyTypes() {
      const locationsStudyTypes = StudyType.enumValues.filter(
        studyType => this.internalValue.some(
          i => getLocationStudyTypes(this.locations[i]).includes(studyType),
        ),
      );
      return [
        ...locationsStudyTypes,
        StudyType.OTHER_MANUAL,
      ];
    },
    selectAll: {
      get() {
        const selectAllIndicesSet = new Set(this.selectAllIndices);
        let k = 0;
        this.internalValue.forEach((i) => {
          if (selectAllIndicesSet.has(i)) {
            k += 1;
          }
        });
        if (k === 0) {
          return false;
        }
        if (k === this.selectAllIndices.length) {
          return true;
        }
        return null;
      },
      set(selectAll) {
        if (selectAll) {
          const internalValueNew = [
            ...this.internalValue,
            ...this.selectAllIndices
              .filter(i => !this.internalValue.includes(i)),
          ];
          this.internalValue = ArrayUtils.sortBy(internalValueNew, i => i);
        } else {
          this.internalValue = this.internalValue
            .filter(i => !this.selectAllIndices.includes(i));
        }
      },
    },
    selectAllIndices() {
      const { centrelineTypes } = this.selectAllType;
      const selectAllIndices = [];
      this.locations.forEach((location, i) => {
        if (centrelineTypes.includes(location.centrelineType)) {
          selectAllIndices.push(i);
        }
      });
      return selectAllIndices;
    },
    showDuration() {
      if (this.selectAll === false) {
        return false;
      }
      return this.internalValue.every((i) => {
        const { studyType } = this.studyRequests[i];
        return studyType !== null && studyType.automatic;
      });
    },
    showHours() {
      if (this.selectAll === false) {
        return false;
      }
      return this.internalValue.every((i) => {
        const { studyType } = this.studyRequests[i];
        return studyType !== null && !studyType.automatic;
      });
    },
  },
  methods: {
    actionSetDaysOfWeek({ selected: selectedPrev, value: dayOfWeek }) {
      const selected = selectedPrev !== true;
      if (selected) {
        this.internalValue.forEach((i) => {
          const { daysOfWeek } = this.studyRequests[i];
          const j = daysOfWeek.indexOf(dayOfWeek);
          if (j === -1) {
            daysOfWeek.push(dayOfWeek);
            this.studyRequests[i].daysOfWeek = ArrayUtils.sortBy(daysOfWeek, d => d);
          }
        });
      } else {
        this.internalValue.forEach((i) => {
          const { daysOfWeek } = this.studyRequests[i];
          const j = daysOfWeek.indexOf(dayOfWeek);
          if (j !== -1) {
            daysOfWeek.splice(j, 1);
          }
        });
      }
    },
    actionSetDuration({ value: duration }) {
      this.internalValue.forEach((i) => {
        this.studyRequests[i].duration = duration;
      });
    },
    actionSetHours({ value: hours }) {
      this.internalValue.forEach((i) => {
        this.studyRequests[i].hours = hours;
      });
    },
    actionSetStudyType({ value: studyType }) {
      const indicesUnactionable = [];
      this.internalValue.forEach((i) => {
        const studyTypes = getLocationStudyTypes(this.locations[i]);
        if (studyType.other || studyTypes.includes(studyType)) {
          this.studyRequests[i].studyType = studyType;
        } else {
          indicesUnactionable.push(i);
        }
      });
      if (indicesUnactionable.length > 0) {
        this.setDialog({
          dialog: 'AlertStudyTypeUnactionable',
          dialogData: {
            indicesUnactionable,
            locations: this.locations,
            studyType,
          },
        });
      }
    },
    ...mapMutations(['setDialog']),
  },
};
</script>

<style lang="scss">
.fc-select-all-type {
  & > .v-input__control {
    width: 180px;
  }
}
</style>
