<template>
  <fieldset class="fc-details-study mb-m">
    <legend class="font-size-l">
      <span class="number-icon">{{indexHuman}}</span>
      {{studyType.label}}
    </legend>
    <div class="mt-m px-m">
      <div class="form-group">
        <strong>What days of the week should the study fall on?</strong>
        <TdsButtonGroup
          v-model="v.daysOfWeek.$model"
          class="font-size-l"
          :invalid="v.daysOfWeek.$error"
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
        <TdsPanel
          v-if="v.daysOfWeek.$error"
          variant="error">
          <p v-if="!v.daysOfWeek.required">
            Please select one or more days of the week.
          </p>
          <p v-else-if="!v.daysOfWeek.needsValidDuration">
            Please select {{duration / 24}} consecutive days for the study,
            or reduce the requested duration.
          </p>
        </TdsPanel>
      </div>
      <div
        v-if="studyType.automatic"
        class="form-group">
        <strong>What's the duration of your study?</strong>
        <TdsRadioGroup
          v-model="v.duration.$model"
          :invalid="v.duration.$error"
          :name="nameDuration"
          :options="[
            { label: '1 day', sublabel: '24 hours', value: 24 },
            { label: '2 days', sublabel: '48 hours', value: 48 },
            { label: '3 days', sublabel: '72 hours', value: 72 },
            { label: '4 days', sublabel: '96 hours', value: 96 },
            { label: '5 days', sublabel: '120 hours', value: 120 },
            { label: '1 week', sublabel: '168 hours', value: 168 },
          ]" />
        <TdsPanel
          v-if="v.duration.$error"
          variant="error">
          <p>
            Please select {{duration / 24}} consecutive days for the study,
            or reduce the requested duration.
          </p>
        </TdsPanel>
      </div>
      <div
        v-else
        class="form-group">
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
        <TdsPanel
          v-if="hours === 'SCHOOL' || hours === 'ROUTINE'"
          icon="clock"
          variant="info">
          <p>
            <small>
              <span
                v-for="([start, end], i) in CountHours[hours]"
                :key="'count-hours-' + i">{{i > 0 ? ', ' : ''}}{{start}}&ndash;{{end}}</span>
            </small>
          </p>
        </TdsPanel>
        <TdsPanel
          v-else-if="hours === 'OTHER'"
          icon="clock"
          variant="warning">
          <p>
            Please specify your desired schedule in
            <a
              href="#"
              @click.prevent="$refs.notes.focus()">
              additional notes.
            </a>
          </p>
        </TdsPanel>
      </div>
      <div class="form-group">
        <strong>Any additional notes you'd like to share?</strong>
        <textarea
          ref="notes"
          v-model="v.notes.$model"
          class="full-width"
          :class="{
            invalid: v.notes.$error,
          }"
          :name="nameNotes"
          rows="4"></textarea>
        <TdsPanel
          v-if="v.notes.$error"
          variant="error">
          <p>
            If you have selected Other hours above, please provide additional
            notes to explain your requirements.
          </p>
        </TdsPanel>
      </div>
    </div>
  </fieldset>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import TdsButtonGroup from '@/src/components/tds/TdsButtonGroup.vue';
import TdsPanel from '@/src/components/tds/TdsPanel.vue';
import TdsRadioGroup from '@/src/components/tds/TdsRadioGroup.vue';
import { CountHours, COUNT_TYPES } from '@/lib/Constants';

export default {
  name: 'FcDetailsStudy',
  components: {
    TdsButtonGroup,
    TdsPanel,
    TdsRadioGroup,
  },
  props: {
    index: Number,
    v: Object,
  },
  data() {
    return {
      CountHours,
    };
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
        return this.study.dateRange;
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
        return this.study.daysOfWeek;
      },
      set(daysOfWeek) {
        this.setStudyMeta({
          i: this.index,
          key: 'daysOfWeek',
          value: daysOfWeek,
        });
        this.v.duration.$touch();
      },
    },
    duration: {
      get() {
        return this.study.duration;
      },
      set(duration) {
        this.setStudyMeta({
          i: this.index,
          key: 'duration',
          value: duration,
        });
        this.v.daysOfWeek.$touch();
      },
    },
    hours: {
      get() {
        return this.study.hours;
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
        return this.study.notes;
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
      return this.studyRequest.priority;
    },
    study() {
      return this.studyRequest.studies[this.index];
    },
    studyType() {
      const { studyType } = this.study;
      return COUNT_TYPES.find(({ value }) => value === studyType);
    },
    ...mapState(['studyRequest']),
  },
  methods: {
    ...mapMutations(['setStudyMeta']),
  },
};
</script>
