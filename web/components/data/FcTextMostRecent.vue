<template>
  <div class="secondary--text">
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
  </div>
</template>

<script>
export default {
  name: 'FcTextMostRecent',
  props: {
    study: Object,
  },
};
</script>
