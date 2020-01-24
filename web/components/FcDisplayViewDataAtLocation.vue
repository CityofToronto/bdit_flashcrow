<template>
  <div class="fc-display-view-data-at-location d-flex flex-column">
    <div class="flex-grow-0 flex-shrink-0 pa-5">
      <SearchBarLocation />
    </div>
    <section class="flex-grow-1 flex-shrink-1 overflow-y-auto">
      <v-progress-linear
        v-if="loadingLocationData"
        indeterminate />
      <template v-else>
        <header class="px-5 pt-1 pb-5">
          <h1 class="display-2">{{location.description}}</h1>
          <div class="mt-2">
            <span v-if="locationFeatureType !== null">
              {{locationFeatureType.description}} &#x2022;
            </span>
            <span>
              2 Studies (9/12/18)
            </span>
          </div>
          <v-row class="mt-5">
            <v-col cols="2">
              <div>KSI</div>
              <div class="headline">2</div>
            </v-col>
            <v-col cols="2">
              <div>Collisions</div>
              <div class="headline">6</div>
            </v-col>
          </v-row>
          <div class="mt-5">
            <div>Nearby</div>
            <div class="mt-1">
              <v-chip
                class="mr-2"
                color="teal lighten-4"
                text-color="teal darken-1">
                <v-avatar left>
                  <v-icon>mdi-school</v-icon>
                </v-avatar>
                School Zone
              </v-chip>
              <v-chip
                class="mr-2"
                color="purple lighten-4"
                text-color="purple darken-1">
                <v-avatar left>
                  <v-icon>mdi-hospital-box</v-icon>
                </v-avatar>
                Hospital
              </v-chip>
              <v-chip
                class="mr-2"
                color="brown lighten-4"
                text-color="brown darken-1">
                <v-avatar left>
                  <v-icon>mdi-fire</v-icon>
                </v-avatar>
                Fire station
              </v-chip>
            </div>
          </div>
        </header>
        <v-divider></v-divider>
        <section>
          <header class="pa-5">
            <div class="align-center d-flex">
              <h2 class="subtitle-1">Studies</h2>
              <div class="caption pl-3">19 total</div>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                outlined>
                <v-icon left>mdi-filter-variant</v-icon>
                Filter
              </v-btn>
              <v-btn
                class="ml-3"
                color="primary">
                Request Study
              </v-btn>
            </div>
          </header>
          <FcDataTableStudies
            :counts="counts"
            @action-item="onActionItem" />
        </section>
      </template>
    </section>
  </div>
</template>

<script>
import {
  mapActions,
  mapGetters,
  mapMutations,
  mapState,
} from 'vuex';

import {
  Status,
} from '@/lib/Constants';
import {
  getCountsByCentrelineSummary,
  getLocationByFeature,
} from '@/lib/api/WebApi';
import FcDataTableStudies from '@/web/components/FcDataTableStudies.vue';
import SearchBarLocation from '@/web/components/SearchBarLocation.vue';

export default {
  name: 'FcDisplayViewDataAtLocation',
  components: {
    FcDataTableStudies,
    SearchBarLocation,
  },
  data() {
    return {
      counts: [],
      loadingLocationData: true,
    };
  },
  computed: {
    ...mapState([
      'auth',
      'location',
    ]),
    ...mapGetters(['locationFeatureType']),
  },
  watch: {
    location(location, locationPrev) {
      if (location === null) {
        this.$router.push({
          name: 'viewData',
        });
        return;
      }
      const {
        centrelineId,
        centrelineType,
      } = location;
      if (locationPrev === null
        || locationPrev.centrelineId !== centrelineId
        || locationPrev.centrelineType !== centrelineType) {
        /*
         * Guard against duplicate navigation, which can happen when first loading the page.
         */
        let {
          centrelineId: centrelineIdRoute,
          centrelineType: centrelineTypeRoute,
        } = this.$route.params;
        centrelineIdRoute = parseInt(centrelineIdRoute, 10);
        centrelineTypeRoute = parseInt(centrelineTypeRoute, 10);
        if (centrelineIdRoute !== centrelineId || centrelineTypeRoute !== centrelineType) {
          /*
           * Update the URL to match the new location.  This allows the user to navigate between
           * recently selected locations with the back / forward browser buttons.
           */
          this.$router.push({
            name: 'viewDataAtLocation',
            params: { centrelineId, centrelineType },
          });
        }
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.syncFromRoute(to)
        .then(() => {
          /* eslint-disable-next-line no-param-reassign */
          vm.loadingLocationData = false;
        });
    });
  },
  beforeRouteUpdate(to, from, next) {
    this.loadingLocationData = true;
    this.syncFromRoute(to)
      .then(() => {
        next();
        this.loadingLocationData = false;
      }).catch((err) => {
        next(err);
      });
  },
  methods: {
    actionRequestStudy() {
      this.setNewStudyRequest([]);
      this.$router.push({ name: 'requestStudyNew' });
    },
    actionShowReports(item) {
      if (item.counts.length === 0) {
        return;
      }
      const [count] = item.counts;
      if (count.status === Status.NO_EXISTING_COUNT) {
        return;
      }
      this.setModal({
        component: 'FcModalShowReports',
        data: item,
      });
    },
    onActionItem({ type, item, options }) {
      const actionOptions = options || {};
      if (type === 'request-study') {
        const studyType = item.id;
        this.actionRequestStudy([studyType], actionOptions);
      } else if (type === 'show-reports') {
        this.actionShowReports(item, actionOptions);
      }
    },
    async syncFromRoute(to) {
      const { centrelineId, centrelineType } = to.params;
      const tasks = [
        getCountsByCentrelineSummary({ centrelineId, centrelineType }),
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
    ...mapActions([
      'fetchCountsByCentreline',
    ]),
    ...mapMutations('requestStudy', [
      'setNewStudyRequest',
    ]),
    ...mapMutations([
      'setFilterCountTypes',
      'setLocation',
      'setModal',
    ]),
  },
};
</script>

<style lang="postcss">
.fc-display-view-data-at-location {
  max-height: 100vh;
  .bar-actions-bulk {
    align-items: center;
    background-color: var(--base-lighter);
  }
  .location-data-loading-spinner {
    height: var(--space-2xl);
    width: var(--space-2xl);
  }
}
</style>
