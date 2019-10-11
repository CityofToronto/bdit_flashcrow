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

    <h2>Warrant Summary</h2>
    <div class="mb-l">
      <table>
        <colgroup>
          <col>
          <col class="col-warrant-description">
          <col span="3">
        </colgroup>
        <thead>
          <tr>
            <th rowspan="2">Warrant</th>
            <th rowspan="2">Description</th>
            <th rowspan="2">Minimum Required</th>
            <th colspan="2">Compliance</th>
          </tr>
          <tr>
            <th>Section %</th>
            <th>Entire %</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th class="br" rowspan="2">1 &ndash; Minimum Vehicular Volume</th>
            <th>
              A. Total vehicular volume
              entering intersection from
              all approaches for each of
              any 8 hours
            </th>
            <td>{{reportData.minVolume.a.threshold.full}}</td>
            <td class="bl">{{reportData.minVolume.a.compliance.avg}}</td>
            <td
              class="font-size-l"
              rowspan="2">
              <strong>{{reportData.minVolume.compliance}}</strong>
            </td>
          </tr>
          <tr>
            <th>
              B. Total vehicular volume
              entering intersection on
              minor road(s) for each of
              the same 8 hours
            </th>
            <td>{{reportData.minVolume.b.threshold.full}}</td>
            <td class="bl">{{reportData.minVolume.b.compliance.avg}}</td>
          </tr>
          <tr>
            <th class="br bt" rowspan="2">2 &ndash; Delay to Cross Traffic</th>
            <th class="bt">
              A. Total vehicular volume along
              major street for each of
              any 8 hours
            </th>
            <td class="bt">{{reportData.delayToCross.a.threshold.full}}</td>
            <td class="bl bt">{{reportData.delayToCross.a.compliance.avg}}</td>
            <td
              class="bt font-size-l"
              rowspan="2">
              <strong>{{reportData.delayToCross.compliance}}</strong>
            </td>
          </tr>
          <tr>
            <th>
              B. Combined vehicular pedestrian
              volumes crossing major road
              for each of the same 8 hours
              (critical volume)
            </th>
            <td>{{reportData.delayToCross.b.threshold.full}}</td>
            <td class="bl">{{reportData.delayToCross.b.compliance.avg}}</td>
          </tr>
          <tr>
            <th class="br bt" rowspan="3">3 &ndash; Collision Hazard</th>
            <th class="bt">
              A. Number of reported
              preventable collisions per
              year averaged over
              preceding 36 months
            </th>
            <td class="bt">{{reportData.collisionHazard.a.threshold}}</td>
            <td class="bl bt">{{reportData.collisionHazard.a.compliance}}</td>
            <td
              class="bt font-size-l"
              rowspan="3">
              <strong>{{reportData.collisionHazard.compliance}}</strong>
            </td>
          </tr>
          <tr>
            <th>
              B. Has adequate trial of
              remedies less restrictive
              than signalization failed to
              reduce frequency of collisions?
            </th>
            <td>
              <i
                class="fa font-size-l"
                :class="{
                  'fa-check': reportData.collisionHazard.b,
                  'fa-times': !reportData.collisionHazard.b,
                }"></i>
            </td>
            <td class="bl">
              {{reportData.collisionHazard.b ? 100 : 0}}
            </td>
          </tr>
          <tr>
            <th>
              C. Has either of above
              warrants (#1 or #2) been
              fulfilled to the extent of 80%
              at least?
            </th>
            <td>
              <i
                class="fa font-size-l"
                :class="{
                  'fa-check': reportData.collisionHazard.c,
                  'fa-times': !reportData.collisionHazard.c,
                }"></i>
            </td>
            <td class="bl">
              {{reportData.collisionHazard.c ? 100 : 0}}
            </td>
          </tr>
          <tr>
            <th class="br bt">4 &ndash; Combination</th>
            <th class="bt">
              Have both of warrants #1, #2
              been satisfied to the extent of
              80% at least for every hour?
            </th>
            <td class="bt">
              <i
                class="fa font-size-l"
                :class="{
                  'fa-check': reportData.combination,
                  'fa-times': !reportData.combination,
                }"></i>
            </td>
            <th class="bl bt">&nbsp;</th>
            <td class="bt font-size-l">
              <strong>{{reportData.combination ? 100 : 0}}</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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

import FcReportWarrantTrafficSignalControlSection from
  '@/web/components/reports/FcReportWarrantTrafficSignalControlSection.vue';

export default {
  name: 'FcReportWarrantTrafficSignalControl',
  components: {
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
