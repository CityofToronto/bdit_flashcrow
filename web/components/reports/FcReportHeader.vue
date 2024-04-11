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
        <span v-if="type">{{type.label}}</span>
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

    <div class="callout ma-3" v-if="this.showCallOut">
      <div class="ma-3">
        <v-icon color="blue">mdi-information</v-icon>
      </div>
      <div class="ml-1 mr-2 pa-2">
        For an in-depth explanation of how to interpret this data,
        <a class="link" href="https://www.notion.so/bditto/How-to-interpret-a-TMC-Summary-Report-310c8b7e9ca74b18b99aadc50dc27196" target="_blank" rel="noopener noreferrer">
          see here
        </a>
      </div>
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
  computed: {
    showCallOut() {
      return this.$parent.type && this.$parent.type.name === 'COUNT_SUMMARY_TURNING_MOVEMENT';
    },
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
  .callout {
    display: flex;
    align-items: center;
    background-color: #ebf6fe;
    color: black;
    border-radius: 5px;
    min-height: 60px;
    font-size: 14px;
  }
  .link {
    text-decoration: none;
    color: #005695;
    font-weight: bold;
  }
}
// only show callout button if there's room
@media only screen and (max-width: 800px) {
  .callout {
    display: none !important;
  }
}
</style>
