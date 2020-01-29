<template>
  <div class="fc-drawer-view-reports-at-location d-flex flex-column">
    <div>
      <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-3 pt-2">
        <v-btn
          icon
          @click="actionNavigateBack">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <h1 class="subtitle-1">Turning Movement Count</h1>
        <div class="mx-1">&#x2022;</div>
        <div>Lawrence Ave &amp; Warden Ave</div>

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
          class="flex-grow-0 mt-0"
          dense
          hide-details
          :items="[]"
          label="10/19/2019 (Sat)">
        </v-overflow-btn>
      </div>

      <v-tabs v-model="indexActiveReportType">
        <v-tab
          v-for="reportType in reportTypes"
          :key="reportType.name">
          {{reportType.label}}
        </v-tab>
      </v-tabs>
    </div>

    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto pt-2">
      <v-progress-linear
        v-if="loading"
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import {
  COUNT_TYPES,
  // ReportFormat,
  ReportType,
} from '@/lib/Constants';
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
      indexActiveReportType: 0,
      counts: [],
    };
  },
  computed: {
    activeReportType() {
      const { indexActiveReportType, reportTypes } = this;
      if (indexActiveReportType > reportTypes.length) {
        return null;
      }
      return reportTypes[indexActiveReportType];
    },
    countType() {
      const { categoryValue } = this.$route.params;
      return COUNT_TYPES.find(({ value }) => value === categoryValue);
    },
    reportTypes() {
      const { value } = this.countType;
      if (value === undefined) {
        return [];
      }
      return OPTIONS_REPORTS[value].filter(({ disabled }) => !disabled);
    },
    ...mapGetters('viewData', ['filterChips']),
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
      const { categoryValue, centrelineId, centrelineType } = to.params;
      await new Promise((resolve) => {
        setTimeout(() => resolve({ categoryValue, centrelineId, centrelineType }), 1000);
      });
    },
  },
};
</script>

<style lang="postcss">
.fc-drawer-view-reports-at-location {
  max-height: 50vh;
}
</style>
