<template>
  <fieldset class="count-details">
    <legend>
      <h3>
        <span class="number-icon">{{index + 1}}</span>
        {{count.type.label}}
      </h3>
    </legend>
    <div class="count-details-body">
      <div class="count-details-column">
        <div class="form-group">
          <label>Pick a date-range for the study
            <DatePicker
              class="date-range"
              :disabled-dates="{start: null, end: twoMonthsOut}"
              :min-date="twoMonthsOut"
              mode="range">
            </DatePicker>
          </label>
        </div>
        <strong>Pick days of the week for the study</strong>
        <div class="count-details-checks">
          <label class="label-vertical">Su
            <input type="checkbox" name="daysOfWeek" value="0" />
          </label>
          <label class="label-vertical">M
            <input type="checkbox" name="daysOfWeek" value="1" />
          </label>
          <label class="label-vertical">T
            <input type="checkbox" name="daysOfWeek" value="2" checked />
          </label>
          <label class="label-vertical">W
            <input type="checkbox" name="daysOfWeek" value="3" checked />
          </label>
          <label class="label-vertical">Th
            <input type="checkbox" name="daysOfWeek" value="4" checked />
          </label>
          <label class="label-vertical">F
            <input type="checkbox" name="daysOfWeek" value="5" />
          </label>
          <label class="label-vertical">Sa
            <input type="checkbox" name="daysOfWeek" value="6" />
          </label>
        </div>
      </div>
      <div class="count-details-column">
        <template v-if="count.type.automatic">
          <strong>Pick the duration of the count</strong>
          <div class="count-details-radios">
            <label>
              <span>1 day<br /><small>24 hours</small></span>
              <input type="radio" name="duration" value="24" />
            </label>
            <label>
              <span>2 days<br /><small>48 hours</small></span>
              <input type="radio" name="duration" value="48" />
            </label>
            <label>
              <span>3 days<br /><small>72 hours</small></span>
              <input type="radio" name="duration" value="72" />
            </label>
            <label>
              <span>4 days<br /><small>96 hours</small></span>
              <input type="radio" name="duration" value="96" />
            </label>
            <label>
              <span>5 days<br /><small>96 hours</small></span>
              <input type="radio" name="duration" value="120" />
            </label>
            <label>
              <span>1 week<br /><small>120 hours</small></span>
              <input type="radio" name="duration" value="168" />
            </label>
          </div>
        </template>
        <template v-else>
          <strong>Pick the type of hours</strong>
          <div class="count-details-radios">
            <label>
              School
              <input type="radio" name="hours" value="SCHOOL" />
            </label>
            <label>
              Routine
              <input type="radio" name="hours" value="ROUTINE" />
            </label>
            <label>
              Other
              <input type="radio" name="hours" value="OTHER" />
            </label>
          </div>
        </template>
      </div>
      <div class="count-details-column">
        <div class="form-group">
          <label>Any additional notes?
            <div>
              <textarea rows="5"></textarea>
            </div>
          </label>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script>
import DatePicker from '@/components/DatePicker.vue';

export default {
  name: 'CountDetails',
  components: {
    DatePicker,
  },
  props: {
    count: Object,
    index: Number,
  },
  data() {
    const now = new Date();
    const twoMonthsOut = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      now.getDate(),
    );
    return {
      now,
      twoMonthsOut,
    };
  },
};
</script>

<style lang="postcss">
.count-details {
  .number-icon {
    border: 1px solid var(--outline-grey);
    border-radius: 50%;
    color: var(--off-black);
    display: inline-block;
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    height: calc(var(--text-xl) * 1.5);
    line-height: var(--text-xl);
    margin-right: var(--sp);
    padding: var(--sp);
    text-align: center;
    width: calc(var(--text-xl) * 1.5);
  }
  & > .count-details-body {
    align-items: flex-start;
    display: flex;
    flex-direction: row;
    & > .count-details-column {
      flex: 0 0 33.3333%;
      padding: 0 calc(var(--sp) * 2);
      & > .count-details-checks {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        & > label {
          margin: calc(var(--sp) * 2) 0;
        }
        .label-vertical {
          text-align: center;
          margin: calc(var(--sp) * 2) var(--sp);
          & > input {
            display: block;
          }
        }
      }
      & > .count-details-radios {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        & > label {
          flex: 0 0 33.3333%;
          margin: calc(var(--sp) * 2) 0;
        }
      }
    }
  }
}
</style>
