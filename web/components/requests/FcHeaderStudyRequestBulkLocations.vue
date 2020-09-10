<template>
  <div class="mx-5">
    <h3 class="headline">{{title}} &#x2022; {{subtitle}}</h3>
    <div class="align-center d-flex">
      <v-checkbox
        v-model="selectAll"
        class="mr-6"
        label="Select all"
        :indeterminate="selectAll === null" />

      <v-spacer></v-spacer>

      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            :disabled="selectAll === false"
            type="secondary">
            <span>Study Type</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item
            v-for="({ text, value }, i) in itemsStudyType"
            :key="i"
            @click="actionSetStudyType(value)">
            <v-list-item-title>{{text}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu min-width="120">
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            class="ml-2"
            :disabled="selectAll === false"
            type="secondary">
            <span>Days</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item
            v-for="({ selected, text, value }, i) in itemsDaysOfWeek"
            :key="i"
            @click="actionSetDaysOfWeek(value, selected)">
            <v-list-item-title class="align-center d-flex">
              <v-simple-checkbox
                class="mx-2"
                dense
                :indeterminate="selected === null"
                :value="selected"
                @click="actionSetDaysOfWeek(value, selected)" />
              <span>{{text}}</span>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu v-if="showDuration">
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            class="ml-2"
            type="secondary">
            <span>Duration</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item
            v-for="({ text, value }, i) in itemsDuration"
            :key="i"
            @click="actionSetDuration(value)">
            <v-list-item-title>{{text}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu v-if="showHours">
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            class="ml-2"
            type="secondary">
            <span>Hours</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item
            v-for="({ text, value }, i) in itemsHours"
            :key="i"
            @click="actionSetHours(value)">
            <v-list-item-title>{{text}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import { StudyHours, StudyType } from '@/lib/Constants';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcHeaderStudyRequestBulkLocations',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcButton,
  },
  props: {
    indices: Array,
    studyRequests: Array,
    title: String,
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
      const itemsStudyType = StudyType.enumValues.map((studyType) => {
        const { label } = studyType;
        return { text: label, value: studyType };
      });
      return ArrayUtils.sortBy(itemsStudyType, ({ label }) => label);
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
    subtitle() {
      const k = this.internalValue.length;
      const n = this.indices.length;
      return `${k} / ${n} selected`;
    },
  },
  methods: {
    actionSetDaysOfWeek(dayOfWeek, selectedPrev) {
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
    actionSetDuration(duration) {
      this.internalValue.forEach((i) => {
        this.studyRequests[i].duration = duration;
      });
    },
    actionSetHours(hours) {
      this.internalValue.forEach((i) => {
        this.studyRequests[i].hours = hours;
      });
    },
    actionSetStudyType(studyType) {
      this.internalValue.forEach((i) => {
        this.studyRequests[i].studyType = studyType;
      });
    },
  },
};
</script>
