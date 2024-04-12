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
    <div
      v-if="studyType !== null && studyType.beta !== null"
      class="beta-wrapper ml-4">
      <FcTextStudyTypeBeta
        large
        :study-type="studyType" />
    </div>

    <v-spacer></v-spacer>

    <div class="text-right">
      <div>{{info}}</div>
      <div>{{subinfo}}</div>
    </div>
  </header>
</template>

<script>
import { ORG_NAME, ReportType, StudyType } from '@/lib/Constants';
import FcTextStudyTypeBeta from '@/web/components/data/FcTextStudyTypeBeta.vue';

export default {
  name: 'FcReportHeader',
  components: {
    FcTextStudyTypeBeta,
  },
  props: {
    info: String,
    subinfo: String,
    studyType: {
      type: StudyType,
      default: null,
    },
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

  & .beta-wrapper {
    line-height: 16px;
    width: 363px;
  }

  .link {
    text-decoration: none;
    color: #005695;
    font-weight: bold;
  }
}
</style>
