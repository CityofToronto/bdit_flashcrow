<template>
  <fieldset class="details fc-details-study">
    <legend>
      <h3>
        <span class="number-icon">{{indexHuman}}</span>
        {{count.type.label}}
      </h3>
    </legend>
    <div class="details-body">
      <div class="details-column">
        <div class="form-group">
          <strong>Pick a date-range for the study</strong>
          <DatePicker
            v-model="dateRange"
            class="date-range"
            :disabled="disableDateRange"
            :disabled-dates="{start: null, end: twoMonthsOut}"
            :min-date="twoMonthsOut"
            mode="range"
            :name="nameDateRange">
          </DatePicker>
        </div>
        <div class="form-group">
          <strong>* Pick days of the week for the study</strong>
          <div class="details-checks">
            <label class="label-vertical">Su
              <input v-model.number="daysOfWeek" type="checkbox" :name="nameDaysOfWeek" value="0" />
            </label>
            <label class="label-vertical">M
              <input v-model.number="daysOfWeek" type="checkbox" :name="nameDaysOfWeek" value="1" />
            </label>
            <label class="label-vertical">T
              <input v-model.number="daysOfWeek" type="checkbox" :name="nameDaysOfWeek" value="2" />
            </label>
            <label class="label-vertical">W
              <input v-model.number="daysOfWeek" type="checkbox" :name="nameDaysOfWeek" value="3" />
            </label>
            <label class="label-vertical">Th
              <input v-model.number="daysOfWeek" type="checkbox" :name="nameDaysOfWeek" value="4" />
            </label>
            <label class="label-vertical">F
              <input v-model.number="daysOfWeek" type="checkbox" :name="nameDaysOfWeek" value="5" />
            </label>
            <label class="label-vertical">Sa
              <input v-model.number="daysOfWeek" type="checkbox" :name="nameDaysOfWeek" value="6" />
            </label>
          </div>
          <div class="validation-error" v-if="!v.daysOfWeek.required">
            At least one day of the week must be selected.
          </div>
        </div>
      </div>
      <div class="details-column">
        <div v-if="count.type.automatic" class="form-group">
          <strong>Pick the duration of the count</strong>
          <div class="details-radios">
            <label>
              <span>1 day<br /><small>24 hours</small></span>
              <input v-model.number="duration" type="radio" :name="nameDuration" value="24" />
            </label>
            <label>
              <span>2 days<br /><small>48 hours</small></span>
              <input v-model.number="duration" type="radio" :name="nameDuration" value="48" />
            </label>
            <label>
              <span>3 days<br /><small>72 hours</small></span>
              <input v-model.number="duration" type="radio" :name="nameDuration" value="72" />
            </label>
            <label>
              <span>4 days<br /><small>96 hours</small></span>
              <input v-model.number="duration" type="radio" :name="nameDuration" value="96" />
            </label>
            <label>
              <span>5 days<br /><small>120 hours</small></span>
              <input v-model.number="duration" type="radio" :name="nameDuration" value="120" />
            </label>
            <label>
              <span>1 week<br /><small>168 hours</small></span>
              <input v-model.number="duration" type="radio" :name="nameDuration" value="168" />
            </label>
          </div>
        </div>
        <template v-else>
          <div class="form-group">
            <strong>Pick the type of hours</strong>
            <div class="details-radios">
              <label>
                School
                <input v-model="hours" type="radio" :name="nameHours" value="SCHOOL" />
              </label>
              <label>
                Routine
                <input v-model="hours" type="radio" :name="nameHours" value="ROUTINE" />
              </label>
              <label>
                Other
                <input v-model="hours" type="radio" :name="nameHours" value="OTHER" />
              </label>
            </div>
          </div>
          <div class="panel panel-info">
            <i class="fa fa-clock"></i>
            <span v-if="hours === 'SCHOOL'">
              07:30 &ndash; 09:30<br />
              10:00 &ndash; 11:00<br />
              12:00 &ndash; 13:30<br />
              14:15 &ndash; 15:45<br />
              16:00 &ndash; 18:00
            </span>
            <span v-else-if="hours === 'ROUTINE'">
              07:30 &ndash; 09:30<br />
              10:00 &ndash; 12:00<br />
              13:00 &ndash; 15:00<br />
              16:00 &ndash; 18:00
            </span>
            <span v-else>
              Use <strong>Any additional notes?</strong> to describe when you want
              the study performed.
            </span>
          </div>
        </template>
      </div>
      <div class="details-column">
        <div class="form-group">
          <label><span v-if="hours === 'OTHER'">*</span> Any additional notes?
            <div>
              <textarea
                v-model="notes"
                :name="nameNotes"
                :required="hours === 'OTHER'"
                rows="5"></textarea>
            </div>
          </label>
          <div class="validation-error" v-if="!v.notes.requiredIfOtherHours">
            Other hours must be described in <strong>Any additional notes?</strong>
          </div>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script>
import DatePicker from '@/components/DatePicker.vue';

export default {
  name: 'FcDetailsStudy',
  components: {
    DatePicker,
  },
  props: {
    index: Number,
    v: Object,
  },
  data() {
    const { now } = this.$store.state;
    const twoMonthsOut = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      now.getDate(),
    );
    return {
      twoMonthsOut,
    };
  },
  computed: {
    count() {
      return this.dataSelection.items[this.index].item;
    },
    dateRange: {
      get() {
        return this.meta.dateRange;
      },
      set(dateRange) {
        this.setDataSelectionItemMeta({
          item: this.count,
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
        this.setDataSelectionItemMeta({
          item: this.count,
          key: 'daysOfWeek',
          value: daysOfWeek,
        });
      },
    },
    disableDateRange() {
      return this.dataSelectionMeta.priority === 'URGENT';
    },
    duration: {
      get() {
        return this.meta.duration;
      },
      set(duration) {
        this.setDataSelectionItemMeta({
          item: this.count,
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
        this.setDataSelectionItemMeta({
          item: this.count,
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
      return this.dataSelectionItemMeta(this.index);
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
        this.setDataSelectionItemMeta({
          item: this.count,
          key: 'notes',
          value: notes,
        });
      },
    },
  },
};
</script>

<style lang="postcss">
.fc-study-details {
  background-color: var(--base-lightest);
  .number-icon {
    background-color: var(--base-lightest);
    border: var(--border-default);
    border-radius: 50%;
    color: var(--ink);
    display: inline-block;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    height: calc(var(--font-size-xl) * 1.5);
    line-height: var(--font-size-xl);
    margin-right: var(--space-s);
    padding: var(--space-s);
    text-align: center;
    width: calc(var(--font-size-xl) * 1.5);
  }
}
</style>
