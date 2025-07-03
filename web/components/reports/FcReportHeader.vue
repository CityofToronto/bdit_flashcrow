<template>
  <header v-if="type" class="fc-report-header align-center d-flex">
    <div class="ml-5 mb-2">
      <img
        alt="City of Toronto"
        src="/cot_logo.png"
        width="120" />
    </div>
    <div v-if="type" class="ml-4">
      <div style="font-size:0.8rem;">{{ORG_NAME}}</div>
      <h3 class="display-1" style="font-size:1.12rem !important;">
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

    <div class="text-right" style="font-size:0.9rem;">
      <div style="font-weight:normal;">{{info}}</div>
      <div>{{subinfo}}</div>
      <div v-if="type.label.startsWith('Collision')">{{ this.dateRange }}</div>
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex';
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
    dateRange() {
      const dateRange = this.filterChipsCommon().filter(item => item.filter === 'dateRange')[0];
      return dateRange ? dateRange.label : '1985 to Present';
    },
  },
  methods: {
    ...mapGetters('viewData', ['filterChipsCommon']),
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
