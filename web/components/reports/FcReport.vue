<template>
  <div class="fc-report">
    <div class="fc-report-header flex-container-row">
      <div class="flex-1">
        <img src="/cot_logo.png" alt="City of Toronto" />
      </div>
      <div class="flex-1 text-center">
        <h2>{{ORG_NAME}}</h2>
        <h3>{{type.label}}</h3>
      </div>
      <div class="flex-1">&nbsp;</div>
    </div>
  </div>
</template>

<script>
import { ReportType } from '@/lib/Constants';

export default {
  name: 'FcReport',
  props: {
    type: ReportType,
    date: Date,
    content: Array,
  },
  data() {
    return {
      ORG_NAME: 'Traffic Safety Unit',
    };
  },
};
</script>

<style lang="postcss">
.fc-report {
  & > .fc-report-header {
    border-bottom: 1px solid var(--primary-dark);
    img {
      height: var(--space-2xl);
    }
    h2,
    h3 {
      color: var(--primary-dark);
    }
  }
}
</style>
