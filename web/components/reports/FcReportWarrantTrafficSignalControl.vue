<template>
  <div class="fc-report-warrant-traffic-signal-control">
    <header class="py-m">
      <div>
        <strong>{{locationQuery}}</strong>
      </div>
      <div>
        <strong>Survey Type: </strong>
        <span>{{hoursHuman}}</span>
      </div>
    </header>

    <FcReportTable v-bind="warrantSummaryLayout" />

    <h2>Warrant 1 &ndash; Minimum Vehicular Volume</h2>
    <FcReportWarrantTrafficSignalControlSection
      :section-data="reportData.minVolume.a"
      title="1A. All Approaches" />
    <FcReportWarrantTrafficSignalControlSection
      :section-data="reportData.minVolume.b"
      title="1B. Minor Street Both Approaches" />

    <h2>Warrant 2 &ndash; Delay To Cross Traffic</h2>
    <FcReportWarrantTrafficSignalControlSection
      :section-data="reportData.delayToCross.a"
      title="2A. Major Road Both Approaches" />
    <FcReportWarrantTrafficSignalControlSection
      :section-data="reportData.delayToCross.b"
      title="2B. Cross Street (Critical Volume)" />

    <h2>Warrant 3 &ndash; Collision Hazard</h2>
    <table class="my-m">
      <caption class="font-size-l my-m text-left">
        3A. Preventable Collisions Per Year
      </caption>
      <thead>
        <tr>
          <th>{{reportData.collisionHazard.a.startYear}}</th>
          <th>{{reportData.collisionHazard.a.startYear + 1}}</th>
          <th class="br">{{reportData.collisionHazard.a.startYear + 2}}</th>
          <th>Total</th>
          <th class="bl">Average</th>
          <th>Minimum Required</th>
          <th class="bl">Section %</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{reportData.collisionHazard.a.annual[0]}}</td>
          <td>{{reportData.collisionHazard.a.annual[1]}}</td>
          <td class="br">{{reportData.collisionHazard.a.annual[2]}}</td>
          <td>{{reportData.collisionHazard.a.value.total}}</td>
          <td class="bl">{{reportData.collisionHazard.a.value.avg}}</td>
          <td>{{reportData.collisionHazard.a.threshold}}</td>
          <td class="bl font-size-l">
            <strong>{{reportData.collisionHazard.a.compliance}}</strong>
          </td>
        </tr>
      </tbody>
    </table>
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
    warrantSummaryLayout() {
      /* eslint-disable prefer-destructuring */
      const reportData = this.reportData;
      return {
        title: 'Warrant Summary',
        columnStyles: [
          { c: 1, width: '4xl' },
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
