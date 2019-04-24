<template>
  <fieldset class="count-details-summary">
    <legend>
      <h3>
        <span class="number-icon">{{indexHuman}}</span>
        {{count.type.label}}
      </h3>
    </legend>
    <div class="count-details-body">
      <div class="count-details-column">
        <div v-if="priority !== 'URGENT'" class="form-group">
          <strong>We'll conduct the study between:</strong>
          <p>
            {{dateRange.start | date}}&ndash;{{dateRange.end | date}}
          </p>
        </div>
        <div class="form-group">
          <strong>The study will occur on these days:</strong>
          <p>
            {{daysOfWeekHuman}}
          </p>
        </div>
      </div>
      <div class="count-details-column">
        <div v-if="count.type.automatic" class="form-group">
          <strong>The count will last this amount of time:</strong>
          <p>
            {{durationHuman}}<br />
            <small>{{duration}} hours</small>
          </p>
        </div>
        <div v-else class="form-group">
          <strong>We'll count these type of hours:</strong>
          <p>
            {{hours}}
          </p>
          <div class="panel panel-primary">
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
          </div>
        </div>
      </div>
      <div class="count-details-column">
        <div class="form-group">
          <template v-if="notes">
            <strong>Your additional notes:</strong>
            <p>
              {{notes}}
            </p>
          </template>
          <strong v-else>No additional notes</strong>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Constants from '@/lib/Constants';

export default {
  name: 'CountDetailsSummary',
  props: {
    index: Number,
  },
  computed: {
    count() {
      return this.dataSelection.items[this.index].item;
    },
    dateRange() {
      return this.meta.dateRange;
    },
    daysOfWeek() {
      return this.meta.daysOfWeek;
    },
    daysOfWeekHuman() {
      return this.daysOfWeek
        .map(i => Constants.DAYS_OF_WEEK[i])
        .join(', ');
    },
    duration() {
      return this.meta.duration;
    },
    durationHuman() {
      const days = this.duration / 24;
      if (days === 1) {
        return '1 day';
      }
      if (days === 7) {
        return '1 week';
      }
      return `${days} days`;
    },
    hours() {
      return this.meta.hours;
    },
    indexHuman() {
      return this.index + 1;
    },
    meta() {
      return this.dataSelectionItemMeta(this.index);
    },
    notes() {
      return this.meta.notes;
    },
    priority() {
      return this.dataSelectionMeta.priority;
    },
    ...mapGetters(['dataSelectionItemMeta', 'dataSelectionMeta']),
    ...mapState(['dataSelection']),
  },
};
</script>

<style lang="postcss">
.count-details-summary {
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
