<template>
<b-row>
  <b-col md="12">
    <h2>
      <span class="badge badge-pill badge-info">{{ index + 1 }}</span>
      {{ count.type.label }} Details
    </h2>
  </b-col>
  <b-col md="4">
    <b-form-group
      label="Count Days"
      :label-for="`input_count_days_${index}`">
      <b-form-checkbox-group
        v-model="countDays"
        :id="`input_count_days_${index}`"
        buttons
        button-variant="outline-primary"
        :options="optionsCountDays" />
    </b-form-group>
  </b-col>
  <b-col md="4">
    <b-form-group
      v-if="countAutomatic"
      label="Duration"
      :label-for="`input_duration_${index}`">
      <b-form-radio-group
        v-model.number="duration"
        :id="`input_duration_${index}`"
        :options="optionsDuration" />
    </b-form-group>
    <b-form-group
      v-else
      label="Hours"
      :label-for="`input_hours_${index}`">
      <b-form-radio-group
        v-model="hours"
        :id="`input_hours_${index}`"
        :options="optionsHours" />
    </b-form-group>
  </b-col>
  <b-col md="4">
    <b-form-group
      label="Additional Notes"
      :label-for="`input_notes_${index}`">
      <b-form-textarea
        v-if="notesEditable"
        v-model="notes"
        :id="`input_notes_${index}`"
        :rows="5"
        no-resize />
      <b-form-textarea
        v-else
        :id="`input_notes_${index}`"
        :rows="5"
        readonly
        :placeholder="notesSchedule"
        no-resize>
      </b-form-textarea>
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
      ],
      optionsHours: [
        { text: 'Routine Hours', value: 'ROUTINE' },
        { text: 'School Hours', value: 'SCHOOL' },
        { text: 'Other', value: 'OTHER' },
      ],
    };
  },
  computed: {
    countAutomatic() {
      return this.count.type.automatic;
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

<style>

</style>
