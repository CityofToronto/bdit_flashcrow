<template>
  <span class="fc-text-most-recent font-weight-regular secondary--text">
    <span v-if="study === null">
      No Previous Study
    </span>
    <template v-else>
      Most Recent
      {{study.startDate | date}} ({{study.startDate | dayOfWeek}})
      &#x2022;
      <span v-if="study.duration !== null">
        {{study.duration | durationHuman}} ({{study.duration}} hrs)
      </span>
      <span
        v-else-if="study.hours !== null"
        :title="study.hours.hint">
        {{study.hours.description}}
      </span>
    </template>
  </span>
</template>

<script>
export default {
  name: 'FcTextMostRecent',
  props: {
    study: Object,
  },
};
</script>

<style lang="scss">
.fc-text-most-recent {
  background-color: rgba(117, 117, 117, 0.1);
  padding: 2px;
}
</style>
