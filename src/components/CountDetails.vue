<template>
<b-row
  class="count-details row-request-step-2"
  :class="summary ? 'pb-3': 'mb-2'">
  <b-col md="12">
    <h3>
      <span class="count-details-number">{{ index + 1 }}</span>
      {{ count.type.label }} Details
    </h3>
  </b-col>
  <b-col md="4">
    <b-form-group
      :description="descriptionCountDays"
      :label="(summary ? '' : '*') + 'Count Days'"
      :label-for="`input_count_days_${index}`">
      <p v-if="summary" class="lead">
        {{countDaysHuman}}
      </p>
      <b-form-checkbox-group
        v-else
        v-model="countDays"
        :id="`input_count_days_${index}`"
        class="input-count-days"
        buttons
        button-variant="outline-primary"
        :options="optionsCountDays" />
    </b-form-group>
  </b-col>
  <b-col md="4">
    <b-form-group
      v-if="countAutomatic"
      label="Duration"
      :label-for="`input_duration_${index}`"
      class="input-duration">
      <p v-if="summary" class="lead">
        {{duration}} hours
      </p>
      <b-form-radio-group
        v-else
        v-model.number="duration"
        :id="`input_duration_${index}`"
        :options="optionsDuration" />
    </b-form-group>
    <b-form-group
      v-else
      label="Hours"
      :label-for="`input_hours_${index}`"
      class="input-hours">
      <p v-if="summary" class="lead">
        <span v-if="hours === 'ROUTINE'">Routine Hours</span>
        <span v-if="hours === 'SCHOOL'">School Hours</span>
        <span v-if="hours === 'OTHER'">Other Hours (see Additional Notes)</span>
      </p>
      <b-form-radio-group
        v-else
        v-model="hours"
        :id="`input_hours_${index}`"
        :options="optionsHours" />
    </b-form-group>
  </b-col>
  <b-col md="4">
    <b-form-group
      :label="labelAdditionalNotes"
      :label-for="`input_notes_${index}`">
      <template v-if="notesEditable">
        <p v-if="summary">
          {{notes}}
        </p>
        <b-form-textarea
          v-else
          v-model="notes"
          :id="`input_notes_${index}`"
          :rows="3"
          no-resize
          :placeholder="placeholderAdditionalNotes" />
      </template>
      <div v-else>
        <div v-for="(hours, index) in notesSchedule.split('\n')" :key="index">
          {{hours}}
        </div>
      </div>
    </b-form-group>
  </b-col>
</b-row>
</template>

<script>
export default {
  name: 'CountDetails',
  props: {
    count: Object,
    index: Number,
    summary: Boolean,
  },
  data() {
    return {
      countDays: [2, 3, 4],
      deliveryDate: null,
      duration: 24,
      hours: 'ROUTINE',
      notes: '',
      optionsCountDays: [
        { text: 'Mon', value: 1 },
        { text: 'Tue', value: 2 },
        { text: 'Wed', value: 3 },
        { text: 'Thu', value: 4 },
        { text: 'Fri', value: 5 },
        { text: 'Sat', value: 6 },
        { text: 'Sun', value: 0 },
      ],
      optionsDuration: [
        { text: '24H', value: 24 },
        { text: '48H', value: 48 },
        { text: '72H', value: 72 },
        { text: '96H', value: 96 },
        { text: '120H', value: 120 },
        { text: '168H', value: 168 },
      ],
      optionsHours: [
        { text: 'Routine', value: 'ROUTINE' },
        { text: 'School', value: 'SCHOOL' },
        { text: 'Other', value: 'OTHER' },
      ],
      placeholderAdditionalNotes:
        'Need a specific time of day, or month for your '
        + 'count?  Let us know any scheduling '
        + 'requirements out of the norm.',
    };
  },
  computed: {
    countAutomatic() {
      return this.count.type.automatic;
    },
    countDaysHuman() {
      const countDaysText = this.optionsCountDays.map(d => d.text);
      const sunday = countDaysText.pop();
      countDaysText.unshift(sunday);
      return this.countDays
        .slice(0)
        .sort((a, b) => {
          let ka = a;
          let kb = b;
          if (ka === 0) {
            ka = 7;
          }
          if (kb === 0) {
            kb = 7;
          }
          return ka - kb;
        })
        .map(d => countDaysText[d]).join(', ');
    },
    descriptionCountDays() {
      if (this.countAutomatic) {
        return 'Your count will be scheduled on these days.';
      }
      return 'Your count will be scheduled on one of these days.';
    },
    labelAdditionalNotes() {
      if (this.notesEditable) {
        return 'Additional Notes';
      }
      if (this.hours === 'ROUTINE') {
        return 'Routine Hours';
      }
      return 'School Hours';
    },
    notesEditable() {
      return this.countAutomatic || this.hours === 'OTHER';
    },
    notesSchedule() {
      if (this.hours === 'ROUTINE') {
        return `07:30-09:30
10:00-12:00
13:00-15:00
16:00-18:00`;
      }
      if (this.hours === 'SCHOOL') {
        return `07:30-09:30
10:00-11:00
12:00-13:30
14:15-15:45
16:00-18:00`;
      }
      return '';
    },
  },
};
</script>

<style lang="postcss">
.count-details {
  background-color: white;
  padding-top: 22px;
}
.count-details-number {
  border: 1px solid black;
  border-radius: 16.5px;
  display: inline-block;
  height: 33px;
  line-height: 30px;
  margin-right: 5px;
  text-align: center;
  width: 33px;
}
.input-count-days {
  width: 100%;
}
.input-duration .custom-radio,
.input-hours .custom-radio {
  width: calc(33% - 1rem);
}
</style>
