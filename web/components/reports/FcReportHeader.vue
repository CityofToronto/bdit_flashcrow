<template>
  <header class="fc-report-header align-center d-flex">
    <div>
      <img
        alt="City of Toronto"
        src="/cot_logo.png"
        width="175" />
    </div>
    <div class="ml-3">
      <div class="title">{{ORG_NAME}}</div>
      <h3 class="display-1">
        <span>{{type.label}}</span>
        <span class="sr-only">{{info}}</span>
        <span class="sr-only">{{subinfo}}</span>
      </h3>
    </div>

    <v-spacer></v-spacer>

    <div class="text-right">
      <div>{{info}}</div>
      <div>{{subinfo}}</div>
    </div>
  </header>
</template>

<script>
import { ORG_NAME, ReportType } from '@/lib/Constants';

export default {
  name: 'FcReportHeader',
  props: {
    info: String,
    subinfo: String,
    type: ReportType,
  },
  data() {
    return {
      ORG_NAME,
    };
  },
};
</script>

<style lang="scss">
.fc-report-header {
  color: var(--v-primary-base);
}
</style>
