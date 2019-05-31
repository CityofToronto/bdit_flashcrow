<template>
  <fieldset class="fc-details-study mb-m">
    <legend>
      <span class="number-icon">{{indexHuman}}</span>
      {{studyType.label}}
    </legend>
    <div class="flex-container-row">
      <div class="form-group flex-1">
        <strong>When do you want your study to be conducted?</strong>
        <DatePicker
          v-model="dateRange"
          mode="range"
          :name="nameDateRange"
          show-icon
          size="l"
          v-bind="attrsDueDate" />
      </div>
      <div class="form-group flex-1">
        <strong>What days of the week should the study fall on?</strong>
        <TdsButtonGroup
          v-model="daysOfWeek"
          class="font-size-l"
          :name="nameDaysOfWeek"
          :options="[
            { label: 'Su', value: 0 },
            { label: 'M', value: 1 },
            { label: 'Tu', value: 2 },
            { label: 'W', value: 3 },
            { label: 'Th', value: 4 },
            { label: 'F', value: 5 },
            { label: 'Sa', value: 6 },
          ]"
          type="checkbox" />
      </div>
    </div>
    <div v-if="studyType.automatic" class="flex-container-row">
      <div class="form-group flex-fill">
        <strong>What's the duration of your study?</strong>
        <TdsRadioGroup
          v-model="duration"
          :name="nameDuration"
          :options="[
            { label: '1 day', sublabel: '24 hours', value: 24 },
            { label: '2 days', sublabel: '48 hours', value: 48 },
            { label: '3 days', sublabel: '72 hours', value: 72 },
            { label: '4 days', sublabel: '96 hours', value: 96 },
            { label: '5 days', sublabel: '120 hours', value: 120 },
            { label: '1 week', sublabel: '168 hours', value: 168 },
          ]" />
      </div>
    </div>
    <div v-else class="flex-container-row">
      <div class="form-group flex-1">
        <strong>What type of hours should we use?</strong>
        <TdsRadioGroup
          v-model="hours"
          class="mb-m"
          :name="nameHours"
          :options="[
            { label: 'School', value: 'SCHOOL' },
            { label: 'Routine', value: 'ROUTINE' },
            { label: 'Other', value: 'OTHER' },
          ]" />
        <div
          v-if="hours === 'SCHOOL'"
          class="tds-panel tds-panel-info">
          <i class="fa fa-clock"></i>
          <p>
            <small>
            07:30&ndash;09:30,
            10:00&ndash;11:00,
            12:00&ndash;13:30,
            14:15&ndash;15:45,
            16:00&ndash;18:00
            </small>
          </p>
        </div>
        <div
          v-else-if="hours === 'ROUTINE'"
          class="tds-panel tds-panel-info">
          <i class="fa fa-clock"></i>
          <p>
            <small>
            07:30&ndash;09:30,
            10:00&ndash;12:00,
            13:00&ndash;15:00,
            16:00&ndash;18:00
            </small>
          </p>
        </div>
        <div
          v-else-if="hours === 'OTHER'"
          class="tds-panel tds-panel-warning">
          <i class="fa fa-clock"></i>
          <p>
            Please specify your desired schedule in
            <a
              href="#"
              @click.prevent="$refs.notes.focus()">
              additional notes.
            </a>
          </p>
        </div>
      </div>
      <div class="form-group flex-1"></div>
    </div>
    <div class="flex-container-row">
      <div class="form-group flex-fill">
        <strong>Any additional notes you'd like to share?</strong>
        <textarea
          ref="notes"
          v-model="notes"
          :name="nameNotes"
          rows="4"></textarea>
      </div>
    </div>
  </fieldset>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import DatePicker from '@/components/DatePicker.vue';
import TdsButtonGroup from '@/components/tds/TdsButtonGroup.vue';
import TdsRadioGroup from '@/components/tds/TdsRadioGroup.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'FcDetailsStudy',
  components: {
    DatePicker,
    TdsButtonGroup,
    TdsRadioGroup,
  },
  props: {
    index: Number,
    v: Object,
  },
  computed: {
    attrsDueDate() {
      const { now } = this.$store.state;
      if (this.priority === 'URGENT') {
        return {
          disabledDates: { start: null, end: now },
          minDate: now,
        };
      }
      const twoMonthsOut = new Date(
        now.getFullYear(),
        now.getMonth() + 2,
        now.getDate(),
      );
      return {
        disabledDates: { start: null, end: twoMonthsOut },
        minDate: twoMonthsOut,
      };
    },
    dateRange: {
      get() {
        return this.meta.dateRange;
      },
      set(dateRange) {
        this.setStudyMeta({
          i: this.index,
          key: 'dateRange',
          value: dateRange,
        });
      },
    },
    daysOfWeek: {
      get() {
        return this.meta.daysOfWeek;
      },
      set(daysOfWeek) {
        this.setStudyMeta({
          i: this.index,
          key: 'daysOfWeek',
          value: daysOfWeek,
        });
      },
    },
    duration: {
      get() {
        return this.meta.duration;
      },
      set(duration) {
        this.setStudyMeta({
          i: this.index,
          key: 'duration',
          value: duration,
        });
      },
    },
    hours: {
      get() {
        return this.meta.hours;
      },
      set(hours) {
        this.setStudyMeta({
          i: this.index,
          key: 'hours',
          value: hours,
        });
        this.v.notes.$touch();
      },
    },
    indexHuman() {
      return this.index + 1;
    },
    meta() {
      return this.studyRequest.items[this.index].meta;
    },
    nameDateRange() {
      return `dateRange_${this.indexHuman}`;
    },
    nameDaysOfWeek() {
      return `daysOfWeek_${this.indexHuman}`;
    },
    nameDuration() {
      return `duration_${this.indexHuman}`;
    },
    nameHours() {
      return `hours_${this.indexHuman}`;
    },
    nameNotes() {
      return `notes_${this.indexHuman}`;
    },
    notes: {
      get() {
        return this.meta.notes;
      },
      set(notes) {
        this.setStudyMeta({
          i: this.index,
          key: 'notes',
          value: notes,
        });
      },
    },
    priority() {
      return this.studyRequest.meta.priority;
    },
    studyType() {
      const studyType = this.studyRequest.items[this.index].item;
      return Constants.COUNT_TYPES
        .find(({ value }) => value === studyType);
    },
    ...mapState(['studyRequest']),
  },
  methods: {
    ...mapMutations(['setStudyMeta']),
  },
};
</script>

<style lang="postcss">
.fc-details-study {

}
</style>
