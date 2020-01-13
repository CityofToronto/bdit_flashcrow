<template>
  <v-card
    class="mb-3 pa-3"
    outlined>
    <v-card-title>
      {{studyType.label}}
    </v-card-title>
    <v-card-text class="mt-m px-m">
      <strong>What days of the week should the study fall on? *</strong>
      <v-row class="pl-1">
        <v-checkbox v-model="v.daysOfWeek.$model" class="mx-2" label="Su" :value="0"></v-checkbox>
        <v-checkbox v-model="v.daysOfWeek.$model" class="mx-2" label="M" :value="1"></v-checkbox>
        <v-checkbox v-model="v.daysOfWeek.$model" class="mx-2" label="Tu" :value="2"></v-checkbox>
        <v-checkbox v-model="v.daysOfWeek.$model" class="mx-2" label="W" :value="3"></v-checkbox>
        <v-checkbox v-model="v.daysOfWeek.$model" class="mx-2" label="Th" :value="4"></v-checkbox>
        <v-checkbox v-model="v.daysOfWeek.$model" class="mx-2" label="F" :value="5"></v-checkbox>
        <v-checkbox v-model="v.daysOfWeek.$model" class="mx-2" label="Sa" :value="6"></v-checkbox>
      </v-row>
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
      <template v-if="studyType.automatic">
        <strong>What's the duration of your study? *</strong>
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
      </template>
      <template v-else>
        <strong>What type of hours should we use? *</strong>
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
      </template>
      <strong>Any additional notes you'd like to share?</strong>
      <v-textarea
        v-model="v.notes.$model"
        ref="notes"
        :class="{
          invalid: v.notes.$error,
        }"
        counter
        filled
        no-resize
        rows="4"></v-textarea>
      <TdsPanel
        v-if="v.notes.$error"
        variant="error">
        <p>
          If you have selected Other hours above, please provide additional
          notes to explain your requirements.
        </p>
      </TdsPanel>
    </v-card-text>
  </v-card>
</template>

<script>
import TdsPanel from '@/web/components/tds/TdsPanel.vue';
import TdsRadioGroup from '@/web/components/tds/TdsRadioGroup.vue';
import { CountHours, COUNT_TYPES } from '@/lib/Constants';

export default {
  name: 'FcDetailsStudy',
  components: {
    TdsPanel,
    TdsRadioGroup,
  },
  props: {
    v: Object,
    value: Object,
  },
  data() {
    return {
      CountHours,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    studyType() {
      const { studyType } = this.internalValue;
      return COUNT_TYPES.find(({ value }) => value === studyType);
    },
  },
};
</script>
