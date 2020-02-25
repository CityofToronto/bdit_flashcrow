<template>
  <section>
    <h2 class="display-1">{{internalValue.studyType.label}}</h2>

    <div class="mt-4">
      <h3 class="headline">Study Days</h3>
      <FcCheckboxGroupChips
        v-model="v.daysOfWeek.$model"
        :items="itemsDaysOfWeek"></FcCheckboxGroupChips>
      <v-messages
        class="mt-1"
        color="error"
        :value="errorMessagesDaysOfWeek"></v-messages>
    </div>

    <div v-if="internalValue.studyType.automatic" class="mt-4">
      <FcRadioGroup
        v-model="v.duration.$model"
        :items="[
          { label: '1 day', sublabel: '24 hours', value: 24 },
          { label: '2 days', sublabel: '48 hours', value: 48 },
          { label: '3 days', sublabel: '72 hours', value: 72 },
          { label: '4 days', sublabel: '96 hours', value: 96 },
          { label: '5 days', sublabel: '120 hours', value: 120 },
          { label: '1 week', sublabel: '168 hours', value: 168 },
        ]">
        <template v-slot:legend>
          <h3 class="headline">Study Duration</h3>
        </template>
      </FcRadioGroup>
    </div>
    <div
      v-else
      class="mt-4">
      <FcRadioGroup
        v-model="internalValue.hours"
        hide-details
        :items="itemsHours">
        <template v-slot:legend>
          <h3 class="headline">Study Hours</h3>
        </template>
      </FcRadioGroup>
    </div>

    <v-textarea
      v-model="v.notes.$model"
      class="mt-4"
      :error-messages="errorMessagesNotes"
      label="Additional Information"
      :messages="messagesNotes"
      no-resize
      outlined
      rows="4"
      @blur="v.notes.$touch()"></v-textarea>
  </section>
</template>

<script>
import {
  StudyHours,
} from '@/lib/Constants';
import {
  OPTIONAL,
  STUDY_OTHER_HOURS_REQUIRES_NOTES,
  STUDY_REQUIRES_DAYS_OF_WEEK,
} from '@/lib/i18n/Strings';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcCheckboxGroupChips from '@/web/components/inputs/FcCheckboxGroupChips.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDetailsStudy',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcCheckboxGroupChips,
    FcRadioGroup,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      OPTIONAL,
    };
  },
  computed: {
    errorMessagesDaysOfWeek() {
      const errors = [];
      if (!this.v.daysOfWeek.$dirty) {
        return errors;
      }
      if (!this.v.daysOfWeek.required) {
        errors.push(STUDY_REQUIRES_DAYS_OF_WEEK.text);
      }
      return errors;
    },
    errorMessagesDuration() {
      const errors = [];
      if (!this.v.duration.$dirty) {
        return errors;
      }
      const { duration } = this.internalValue;
      if (!this.v.duration.needsValidDaysOfWeek) {
        const days = duration / 24;
        const msg = `Please select ${days} consecutive days or reduce study duration.`;
        errors.push(msg);
      }
      return errors;
    },
    errorMessagesNotes() {
      const errors = [];
      if (!this.v.notes.$dirty) {
        return errors;
      }
      if (!this.v.notes.requiredIfOtherHours) {
        errors.push(STUDY_OTHER_HOURS_REQUIRES_NOTES.text);
      }
      return errors;
    },
    itemsDaysOfWeek() {
      return TimeFormatters.DAYS_OF_WEEK.map((text, value) => ({ text, value }));
    },
    itemsHours() {
      return StudyHours.enumValues.map((value) => {
        const { hint, description: label } = value;
        return { hint, label, value };
      });
    },
    messagesNotes() {
      const { hours } = this.internalValue;
      if (hours === StudyHours.OTHER) {
        return [];
      }
      return [OPTIONAL.text];
    },
  },
};
</script>
