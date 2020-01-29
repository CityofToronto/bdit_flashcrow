<template>
  <div class="fc-drawer-view-reports-at-location d-flex flex-column">
    <v-progress-linear
      v-if="loading"
      indeterminate />
    <template v-else>
      <div>
        <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 pt-2">
          <v-btn
            icon
            @click="actionNavigateBack">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <h1 class="subtitle-1">Turning Movement Count</h1>
          <div class="mx-1">&#x2022;</div>
          <div>{{location.description}}</div>

          <div
            v-if="filterChips.length > 0">
            <v-chip
              v-for="(filterChip, i) in filterChips"
              :key="i"
              class="ml-2"
              close
              color="blue lighten-4"
              @click:close="removeFilter(filterChip)">
              {{filterChip.label}}
            </v-chip>
          </div>

          <v-spacer></v-spacer>

          <v-overflow-btn
            v-model="indexActiveCount"
            class="select-counts flex-grow-0 mt-0"
            dense
            hide-details
            :items="itemsCounts"
            :label="labelActiveCount">
          </v-overflow-btn>
        </div>

        <v-tabs v-model="indexActiveReportType">
          <v-tab
            v-for="reportType in reportTypes"
            :key="reportType.name">
            {{reportType.label}}
          </v-tab>
        </v-tabs>
        <v-divider></v-divider>
      </div>

      <section class="flex-grow-1 flex-shrink-1 overflow-y-auto pt-2">
        <v-progress-linear
          v-if="loadingReportLayout"
          indeterminate />
        <div
          v-else
          class="pa-5">
          <h2>TODO: SHOW REPORT HERE</h2>
          <p>
      Cornhole pug umami, vice coloring book selfies copper mug health goth trust
      fund banjo iceland ethical. Quinoa iceland organic succulents vaporware
      normcore. Gastropub hoodie farm-to-table iceland celiac gochujang.
      Pour-over keffiyeh skateboard organic.
      </p><p>
      Ethical pinterest tacos kogi hot chicken banjo wolf, coloring book gastropub
      chambray kinfolk vexillologist. Scenester austin air plant XOXO gentrify
      swag retro. Asymmetrical pinterest small batch photo booth ramps vegan
      affogato cardigan raw denim mustache. Godard polaroid typewriter ethical,
      synth intelligentsia chambray cold-pressed.
      </p><p>
      Shabby chic banjo snackwave, pok pok selfies intelligentsia locavore umami
      yr butcher enamel pin 8-bit. Pug farm-to-table yuccie direct trade
      shoreditch lomo +1 hell of keffiyeh put a bird on it hot chicken vice
      bespoke migas. Kogi la croix chicharrones flexitarian brooklyn vape
      dreamcatcher heirloom tousled try-hard venmo whatever cronut. Portland
      kitsch raclette +1 cred. Vape schlitz plaid, succulents pug affogato
      la croix flexitarian aesthetic raclette kickstarter thundercats forage.
      Narwhal listicle jianbing readymade sustainable portland, chartreuse
      pickled mumblecore umami vice. Etsy ramps semiotics occupy, sustainable
      poutine everyday carry synth.
      </p><p>
      Hot chicken hella disrupt, coloring book subway tile listicle gochujang.
      Poke four dollar toast tbh marfa, scenester ramps crucifix vaporware
      intelligentsia shaman waistcoat whatever. Shaman +1 vaporware everyday
      carry, sartorial activated charcoal banjo gentrify yr organic truffaut
      photo booth. Intelligentsia affogato knausgaard scenester banh mi, swag
      ennui gastropub tattooed copper mug. Everyday carry readymade portland
      man bun shaman. Subway tile tbh salvia etsy gentrify, tousled bitters
      bushwick cornhole meh PBR&B bicycle rights kale chips. Gluten-free
      hashtag 3 wolf moon ramps selfies meditation tumblr cliche enamel
      pin bespoke squid.
      </p><p>
      Fingerstache whatever etsy, slow-carb la croix kickstarter shoreditch
      actually. Seitan jean shorts flexitarian fixie knausgaard pinterest.
      Four loko man braid portland ugh kogi. Tofu roof party vegan, meggings
      viral tattooed tumblr brooklyn. PBR&B street art hella la croix selfies.
      Sriracha ennui air plant, bicycle rights street art selvage tattooed
      portland.
      </p>
        </div>
      </section>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import {
  COUNT_TYPES,
  ReportBlock,
  ReportFormat,
  ReportType,
} from '@/lib/Constants';
import { reporterFetch } from '@/lib/api/BackendClient';
import {
  getCountsByCentreline,
  getLocationByFeature,
} from '@/lib/api/WebApi';
import TimeFormatters from '@/lib/time/TimeFormatters';
import FcMixinRouteAsync from '@/web/mixins/FcMixinRouteAsync';

/*
const DOWNLOAD_FORMATS_SUPPORTED = [
  ReportFormat.CSV,
  ReportFormat.PDF,
];
*/

const OPTIONS_REPORTS_ATR_VOLUME = [
  ReportType.COUNT_SUMMARY_24H_GRAPHICAL,
  ReportType.COUNT_SUMMARY_24H_DETAILED,
  ReportType.COUNT_SUMMARY_24H,
];
const OPTIONS_REPORTS = {
  ATR_VOLUME_BICYCLE: OPTIONS_REPORTS_ATR_VOLUME,
  TMC: [
    ReportType.COUNT_SUMMARY_TURNING_MOVEMENT,
    ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED,
    ReportType.INTERSECTION_SUMMARY,
    ReportType.WARRANT_TRAFFIC_SIGNAL_CONTROL,
  ],
  RESCU: OPTIONS_REPORTS_ATR_VOLUME,
  ATR_VOLUME: OPTIONS_REPORTS_ATR_VOLUME,
  ATR_SPEED_VOLUME: [
    ReportType.SPEED_PERCENTILE,
    ...OPTIONS_REPORTS_ATR_VOLUME,
  ],
  PXO_OBSERVE: [
    ReportType.CROSSWALK_OBSERVANCE_SUMMARY,
  ],
  PED_DELAY: [
    ReportType.PED_DELAY_SUMMARY,
  ],
};

export default {
  name: 'FcDrawerViewReportsAtLocation',
  mixins: [FcMixinRouteAsync],
  data() {
    return {
      counts: [],
      indexActiveCount: 0,
      indexActiveReportType: 0,
      loadingReportLayout: false,
      reportLayout: null,
    };
  },
  computed: {
    activeCount() {
      const { indexActiveCount, counts } = this;
      if (indexActiveCount >= counts.length) {
        return null;
      }
      return counts[indexActiveCount];
    },
    activeReportType() {
      const { indexActiveReportType, reportTypes } = this;
      if (indexActiveReportType >= reportTypes.length) {
        return null;
      }
      return reportTypes[indexActiveReportType];
    },
    countType() {
      const { categoryValue } = this.$route.params;
      return COUNT_TYPES.find(({ value }) => value === categoryValue);
    },
    filterParamsPaginated() {
      const { filterParams } = this;
      const filters = {
        ...filterParams,
        limit: 10,
        offset: 0,
      };
      delete filters.studyType;
      return filters;
    },
    itemsCounts() {
      return this.counts.map((count, i) => {
        const date = TimeFormatters.formatDefault(count.date);
        const dayOfWeek = TimeFormatters.formatDayOfWeek(count.date);
        const text = `${date} (${dayOfWeek})`;
        return { text, value: i };
      });
    },
    labelActiveCount() {
      const { activeCount } = this;
      if (activeCount === null) {
        return null;
      }
      const date = TimeFormatters.formatDefault(activeCount.date);
      const dayOfWeek = TimeFormatters.formatDayOfWeek(activeCount.date);
      return `${date} (${dayOfWeek})`;
    },
    reportTypes() {
      const { value } = this.countType;
      if (value === undefined) {
        return [];
      }
      return OPTIONS_REPORTS[value].filter(({ disabled }) => !disabled);
    },
    ...mapState(['location']),
    ...mapGetters('viewData', ['filterChips', 'filterParams']),
  },
  watch: {
    activeCount() {
      this.updateReportLayout();
    },
    activeReportType() {
      this.updateReportLayout();
    },
  },
  methods: {
    actionNavigateBack() {
      const { centrelineId, centrelineType } = this.$route.params;
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { centrelineId, centrelineType },
      });
    },
    async loadAsyncForRoute(to) {
      const { centrelineId, centrelineType, categoryValue: studyType } = to.params;
      const tasks = [
        getCountsByCentreline(
          { centrelineId, centrelineType },
          studyType,
          this.filterParamsPaginated,
        ),
        getLocationByFeature({ centrelineId, centrelineType }),
      ];
      const [counts, location] = await Promise.all(tasks);
      this.counts = counts;

      if (this.location === null
          || location.centrelineId !== this.location.centrelineId
          || location.centrelineType !== this.location.centrelineType
          || location.description !== this.location.description) {
        this.setLocation(location);
      }
    },
    async updateReportLayout() {
      const { activeCount, activeReportType } = this;
      if (activeCount === null || activeReportType === null) {
        return;
      }
      this.loadingReportLayout = true;

      const { name: type } = activeReportType;
      const countInfoId = activeCount.id;
      const categoryId = activeCount.type.id;
      const id = `${categoryId}/${countInfoId}`;
      const options = {
        method: 'GET',
        data: {
          type,
          id,
          format: ReportFormat.WEB,
          // ...this.reportParameters,
        },
      };
      const {
        type: reportTypeStr,
        date: reportDate,
        content,
      } = await reporterFetch('/reports', options);
      const reportType = ReportType.enumValueOf(reportTypeStr);
      const reportContent = content.map(({ type: blockTypeStr, options: blockOptions }) => {
        const blockType = ReportBlock.enumValueOf(blockTypeStr);
        return {
          type: blockType,
          options: blockOptions,
        };
      });
      this.reportLayout = {
        type: reportType,
        date: reportDate,
        content: reportContent,
      };

      this.loadingReportLayout = false;
    },
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="postcss">
.fc-drawer-view-reports-at-location {
  max-height: 50vh;

  .select-counts {
    width: 250px;
  }
}
</style>
