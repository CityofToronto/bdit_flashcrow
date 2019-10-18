<template>
  <div class="fc-report-warrant-traffic-signal-control">
    <header class="py-m">
      <div>
        <strong>{{count.locationDesc}}</strong>
      </div>
      <div>
        <strong>Survey Type: </strong>
        <span>{{hoursHuman}}</span>
      </div>
    </header>

    <FcReportTable v-bind="warrantSummaryTableLayout" />

    <FcReportWarrantTrafficSignalControlSection
      :title="'Warrant 1 \u2013 Minimum Vehicular Volume'"
      caption="1A. All Approaches"
      :section-data="reportData.minVolume.a" />
    <FcReportWarrantTrafficSignalControlSection
      caption="1B. Minor Street Both Approaches"
      :section-data="reportData.minVolume.b" />

    <FcReportWarrantTrafficSignalControlSection
      :title="'Warrant 2 \u2013 Delay To Cross Traffic'"
      caption="2A. Major Road Both Approaches"
      :section-data="reportData.delayToCross.a" />
    <FcReportWarrantTrafficSignalControlSection
      caption="2B. Cross Street (Critical Volume)"
      :section-data="reportData.delayToCross.b" />

    <FcReportTable v-bind="preventableCollisionsTableLayout" />
    <div>
      <div class="font-size-l my-m text-left">
        3B. Adequate Trial of Less Restrictive Remedies?
      </div>
      <i
        class="fa font-size-l"
        :class="{
          'fa-check': reportData.collisionHazard.b,
          'fa-times': !reportData.collisionHazard.b,
        }"></i>
    </div>
    <div>
      <div class="font-size-l my-m text-left">
        3C. Either warrant 1 or 2 at least {{COMPLIANCE_PARTIAL}}% met?
      </div>
      <i
        class="fa font-size-l"
        :class="{
          'fa-check': reportData.collisionHazard.c,
          'fa-times': !reportData.collisionHazard.c,
        }"></i>
    </div>

    <h2>Warrant 4 &ndash; Combination Hazard</h2>
    <div>
      <div class="font-size-l my-m text-left">
        4. Both warrant 1 and 2 at least {{COMPLIANCE_PARTIAL}}% met for every hour?
      </div>
      <i
        class="fa font-size-l"
        :class="{
          'fa-check': reportData.combination,
          'fa-times': !reportData.combination,
        }"></i>
    </div>
  </div>
</template>

<script>
import { format } from 'd3-format';
import { mapState } from 'vuex';

import FcReportTable from
  '@/web/components/reports/FcReportTable.vue';
import FcReportWarrantTrafficSignalControlSection from
  '@/web/components/reports/FcReportWarrantTrafficSignalControlSection.vue';

export default {
  name: 'FcReportWarrantTrafficSignalControl',
  components: {
    FcReportTable,
    FcReportWarrantTrafficSignalControlSection,
  },
  props: {
    count: Object,
    reportData: Object,
  },
  data() {
    return {
      COMPLIANCE_FULL: 100,
      COMPLIANCE_PARTIAL: 80,
      // TODO: actual user-entered parameters here
      options: {
        adequateTrial: true,
        collisionsTotal: 25,
        preparedBy: 'Foo Bar',
        preventablesByYear: [3, 5, 10],
        startYear: 2016,
      },
    };
  },
  computed: {
    hoursHuman() {
      const { hours } = this.count;
      if (hours === 'ROUTINE') {
        return 'Routine Hours';
      }
      if (hours === 'SCHOOL') {
        return 'School Hours';
      }
      return 'Other Hours';
    },
    preventableCollisionsTableLayout() {
      const sectionData = this.reportData.collisionHazard.a;
      return {
        title: 'Warrant 3 \u2013 Collision Hazard',
        caption: '3A. Preventable Collisions Per Year',
        header: [
          [
            { value: sectionData.startYear },
            { value: sectionData.startYear + 1 },
            {
              value: sectionData.startYear + 2,
              style: { br: true },
            },
            { value: 'Total' },
            {
              value: 'Average',
              style: { bl: true },
            },
            { value: 'Minimum Required' },
            {
              value: 'Section %',
              style: { bl: true },
            },
          ],
        ],
        body: [
          [
            { value: sectionData.annual[0] },
            { value: sectionData.annual[1] },
            {
              value: sectionData.annual[2],
              style: { br: true },
            },
            { value: sectionData.value.total },
            {
              value: format('.2f')(sectionData.value.avg),
              style: { bl: true },
            },
            { value: sectionData.threshold },
            {
              value: sectionData.compliance,
              style: { bold: true, bl: true, fontSize: 'l' },
            },
          ],
        ],
      };
    },
    warrantSummaryTableLayout() {
      /* eslint-disable prefer-destructuring */
      const reportData = this.reportData;
      return {
        title: 'Warrant Summary',
        columnStyles: [
          {
            c: 1,
            style: { width: '4xl' },
          },
        ],
        header: [
          [
            { value: 'Warrant', rowspan: 2 },
            { value: 'Description', rowspan: 2 },
            { value: 'Minimum Required', rowspan: 2 },
            { value: 'Compliance', colspan: 2 },
          ],
          [
            { value: 'Section %' },
            { value: 'Entire %' },
          ],
        ],
        body: [
          [
            {
              value: '1 \u2013 Minimum Vehicular Volume',
              header: true,
              rowspan: 2,
              style: { br: true },
            },
            {
              value: `A. Total vehicular volume
              entering intersection from
              all approaches for each of
              any 8 hours`,
              header: true,
            },
            {
              value: reportData.minVolume.a.threshold.full,
            },
            {
              value: reportData.minVolume.a.compliance.avg,
              style: { bl: true },
            },
            {
              value: reportData.minVolume.compliance,
              rowspan: 2,
              style: { bold: true, fontSize: 'l' },
            },
          ],
          [
            {
              value: `B. Total vehicular volume
              entering intersection on
              minor road(s) for each of
              the same 8 hours`,
              header: true,
            },
            {
              value: reportData.minVolume.b.threshold.full,
            },
            {
              value: reportData.minVolume.b.compliance.avg,
              style: { bl: true },
            },
          ],
          [
            {
              value: '2 \u2013 Delay to Cross Traffic',
              header: true,
              rowspan: 2,
              style: { br: true, bt: true },
            },
            {
              value: `A. Total vehicular volume along
              major street for each of
              any 8 hours`,
              header: true,
              style: { bt: true },
            },
            {
              value: reportData.delayToCross.a.threshold.full,
              style: { bt: true },
            },
            {
              value: reportData.delayToCross.a.compliance.avg,
              style: { bl: true, bt: true },
            },
            {
              value: reportData.delayToCross.compliance,
              rowspan: 2,
              style: { bold: true, bt: true, fontSize: 'l' },
            },
          ],
          [
            {
              value: `B. Combined vehicular pedestrian
              volumes crossing major road
              for each of the same 8 hours
              (critical volume)`,
              header: true,
            },
            {
              value: reportData.delayToCross.b.threshold.full,
            },
            {
              value: reportData.delayToCross.b.compliance.avg,
              style: { bl: true },
            },
          ],
          [
            {
              value: '3 \u2013 Collision Hazard',
              header: true,
              rowspan: 3,
              style: { br: true, bt: true },
            },
            {
              value: `A. Number of reported
              preventable collisions per
              year averaged over
              preceding 36 months`,
              header: true,
              style: { bt: true },
            },
            {
              value: reportData.collisionHazard.a.threshold,
              style: { bt: true },
            },
            {
              value: reportData.collisionHazard.a.compliance,
              style: { bl: true, bt: true },
            },
            {
              value: reportData.collisionHazard.compliance,
              rowspan: 3,
              style: { bold: true, bt: true, fontSize: 'l' },
            },
          ],
          [
            {
              value: `B. Has adequate trial of
              remedies less restrictive
              than signalization failed to
              reduce frequency of collisions?`,
              header: true,
            },
            {
              value: reportData.collisionHazard.b,
              style: { fontSize: 'l' },
            },
            {
              value: reportData.collisionHazard.b ? 100 : 0,
              style: { bl: true },
            },
          ],
          [
            {
              value: `C. Has either of above
              warrants (#1 or #2) been
              fulfilled to the extent of 80%
              at least?`,
              header: true,
            },
            {
              value: reportData.collisionHazard.c,
              style: { fontSize: 'l' },
            },
            {
              value: reportData.collisionHazard.c ? 100 : 0,
              style: { bl: true },
            },
          ],
          [
            {
              value: '4 \u2013 Combination',
              header: true,
              style: { br: true, bt: true },
            },
            {
              value: `Have both of warrants #1, #2
              been satisfied to the extent of
              80% at least for every hour?`,
              header: true,
              style: { bt: true },
            },
            {
              value: reportData.combination,
              style: { bt: true, fontSize: 'l' },
            },
            {
              value: null,
              style: { bl: true, bt: true },
            },
            {
              value: reportData.combination ? 100 : 0,
              style: { bold: true, bt: true, fontSize: 'l' },
            },
          ],
        ],
      };
    },
    ...mapState(['locationQuery']),
  },
};
</script>

<style lang="postcss">
.fc-report-warrant-traffic-signal-control {
  .col-warrant-description {
    width: calc(var(--space-3xl) * 2);
  }
  table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    & > thead {
      background-color: var(--base-lighter);
      & > tr > th {
        padding: var(--space-xs) var(--space-s);
      }
    }
    & > tbody {
      & > tr > th {
        padding: var(--space-xs) var(--space-s);
      }
      & > tr > td {
        padding: var(--space-xs) var(--space-s);
        text-align: right;
      }
      & > tr:nth-child(2n) {
        background-color: var(--base-lighter);
      }
    }
    & > tfoot {
      & > tr > th {
        padding: var(--space-xs) var(--space-s);
      }
      & > tr > td {
        padding: var(--space-xs) var(--space-s);
        text-align: right;
      }
    }
  }
}
</style>
