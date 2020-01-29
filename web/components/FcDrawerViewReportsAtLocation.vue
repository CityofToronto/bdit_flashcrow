<template>
  <div class="fc-drawer-view-reports-at-location d-flex flex-column">
    <div class="flex-grow-0 flex-shrink-0 pa-5">
      <h1>header</h1>
    </div>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
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
/*
import {
  ReportFormat,
  ReportType,
} from '@/lib/Constants';

const DOWNLOAD_FORMATS_SUPPORTED = [
  ReportFormat.CSV,
  ReportFormat.PDF,
];

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
    ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_ILLUSTRATED,
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
*/

function getToast() {
  return { variant: 'error', text: 'oops' };
}

export default {
  name: 'FcDrawerViewReportsAtLocation',
  data() {
    return {
      loading: false,
    };
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.syncFromRoute(to);
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.syncFromRoute(to)
      .then(() => {
        next();
      }).catch((err) => {
        next(err);
      });
  },
  methods: {
    async syncFromRoute(to) {
      this.loading = true;
      const { categoryValue, centrelineId, centrelineType } = to.params;
      try {
        await new Promise((resolve) => {
          setTimeout(() => resolve({ categoryValue, centrelineId, centrelineType }), 1000);
        });
        this.loading = false;
      } catch (err) {
        const toast = getToast(err);
        this.setToast(toast);
        this.$router.push({
          name: 'viewDataAtLocation',
          params: { centrelineId, centrelineType },
        });
      }
    },
  },
};
</script>

<style lang="postcss">
.fc-drawer-view-reports-at-location {
  max-height: 50vh;
}
</style>
