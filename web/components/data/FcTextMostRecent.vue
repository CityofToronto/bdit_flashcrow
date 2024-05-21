<template>
  <span class="fc-text-most-recent font-weight-regular secondary--text">
    <span v-if="study === null">
      No Previous Study
    </span>
    <template v-else>
      <span class="fc-nowrap">
        <v-icon small>mdi-clock</v-icon>
        {{study.startDate | date}} ({{study.startDate | dayOfWeek}})
      </span>
      <template v-if="!minimal">
        <span v-if="study.duration !== null">
          &bull; {{study.duration | durationHuman}} ({{study.duration}} hrs)
        </span>
        <span
          v-else-if="study.hours !== null"
          :title="study.hours.hint">
          &bull; {{study.hours.description}}
        </span>
      </template>
    </template>
  </span>
</template>

<script>
export default {
  name: 'FcTextMostRecent',
  props: {
    study: Object,
    minimal: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss">
.fc-text-most-recent {
  background-color: rgba(117, 117, 117, 0.1);
  padding: 2px;
  & .fc-nowrap {
    white-space: nowrap;
  }
}
</style>
