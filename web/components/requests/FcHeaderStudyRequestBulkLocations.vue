<template>
  <div class="mx-5">
    <div class="align-center d-flex">
      <v-checkbox
        ref="autofocus"
        v-model="selectAll"
        class="mr-6"
        label="Select all"
        :indeterminate="selectAll === null" />

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
import { StudyHours, StudyType } from '@/lib/Constants';
import { getLocationStudyTypes } from '@/lib/geo/CentrelineUtils';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcMenu from '@/web/components/inputs/FcMenu.vue';
import FcMixinInputAutofocus from '@/web/mixins/FcMixinInputAutofocus';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcHeaderStudyRequestBulkLocations',
  mixins: [
    FcMixinInputAutofocus,
    FcMixinVModelProxy(Array),
  ],
  directives: {
    Ripple,
  },
  components: {
    FcMenu,
  },
  props: {
    indices: Array,
    locations: Array,
    studyRequests: Array,
  },
  computed: {
    itemsDuration() {
      return [
        { text: '1 day', value: 24 },
        { text: '2 days', value: 48 },
        { text: '3 days', value: 72 },
        { text: '4 days', value: 96 },
        { text: '5 days', value: 120 },
        { text: '1 week', value: 168 },
      ];
    },
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
      const itemsStudyType = this.locationsStudyTypes.map((studyType) => {
        const { label } = studyType;
        return { text: label, value: studyType };
      });
      return ArrayUtils.sortBy(itemsStudyType, ({ label }) => label);
    },
    locationsStudyTypes() {
      let locationIndices = this.indices;
      if (this.internalValue.length > 0) {
        locationIndices = this.internalValue;
      }
      return StudyType.enumValues.filter(studyType => locationIndices.some(
        i => getLocationStudyTypes(this.locations[i]).includes(studyType),
      ));
    },
    selectAll: {
      get() {
        const k = this.internalValue.length;
        if (k === 0) {
          return false;
        }
        if (k === this.indices.length) {
          return true;
        }
        return null;
      },
      set(selectAll) {
        if (selectAll) {
          this.internalValue = [...this.indices];
        } else {
          this.internalValue = [];
        }
      },
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
        if (studyTypes.includes(studyType)) {
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
