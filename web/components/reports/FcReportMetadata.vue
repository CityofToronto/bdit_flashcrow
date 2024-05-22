<template>
  <div>
    <v-row class="mb-6" tag="dl">
      <v-col v-for="({ cols, name, value, tooltip }, i) in entries" :key="i" :cols="cols">
        <dt class="subtitle-1 font-weight-medium">{{ name }}</dt>
        <dd v-if="tooltip != null" class="mt-1 display-1 font-weight-medium">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <FcTextReportValue text-null="None" :value="value" style="padding-right: 0.5rem;"/>
              <FcButton type="icon" v-on="on"><v-icon>mdi-help-circle-outline</v-icon></FcButton>
            </template>
            <span>{{ tooltip }}</span>
          </v-tooltip>
        </dd>
        <dd v-else class="mt-1 display-1 font-weight-medium">
        <FcTextReportValue
          text-null="None"
          :value="value" />
      </dd>
      </v-col>
    </v-row>

    <div v-if="numFilters > 0 && this.type.label.startsWith('Collision')" class="px-0">
      <v-row class="align-center mx-0 px-1">
        <h3 class="flex-1">{{ numFilters }} Filter{{ this.numFilters > 1 ? 's' : '' }}</h3>
        <FcButton @click="isExpanded = !isExpanded" type="icon" class="flex-1">
          <v-icon v-if="isExpanded">mdi-menu-up</v-icon>
          <v-icon v-else>mdi-menu-down</v-icon>
        </FcButton>
      </v-row>
      <v-expand-transition>
        <ul v-show="isExpanded" class="pt-1">
          <li v-for="(item, i) in collisionFilters" :key="i">
            <b>{{ item.filter }}: </b> {{ item.label }}
          </li>
        </ul>
      </v-expand-transition>
    </div>

    <div class="callout-container" v-if="this.showCallOut">
      <div class="callout ma-3">
        <div class="ma-3">
          <v-icon color="blue">mdi-information</v-icon>
        </div>
        <div class="ml-1 mr-2 pr-2 py-2">
          For an in-depth explanation of how to interpret this data,
          <a class="link"
            href="https://bditto.notion.site/How-to-interpret-a-TMC-Summary-Report-310c8b7e9ca74b18b99aadc50dc27196"
            target="_blank" rel="noopener noreferrer">
            see here
          </a>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { ReportType } from '@/lib/Constants';
import FcTextReportValue from '@/web/components/data/FcTextReportValue.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcReportMetadata',
  components: {
    FcButton,
    FcTextReportValue,
  },
  props: {
    entries: Array,
    type: ReportType,
  },
  data() {
    return {
      isExpanded: false,
    };
  },
  computed: {
    showCallOut() {
      return this.$parent.type && this.$parent.type.name === 'COUNT_SUMMARY_TURNING_MOVEMENT';
    },
    collisionFilters() {
      const collisionFilters = [...this.filterChipsCollision()];
      const daysOfWeek = this.filterChipsCommon().filter(item => item.filter === 'daysOfWeek')[0];
      if (daysOfWeek) {
        collisionFilters.push(daysOfWeek);
      }
      return this.readableFilters(collisionFilters);
    },
    numFilters() {
      return this.collisionFilters.length;
    },
  },
  methods: {
    readableFilters(filters) {
      const readableFilters = [];
      const filtersMap = {
        validated: 'Verification',
        daysOfWeek: 'Days of the Week',
        details: 'Collision Details',
        emphasisAreas: 'Vision Zero Emphasis Areas',
        mvcr: 'MVCR',
        injury: 'Injuries',
        drivact: 'Driver Action',
        drivcond: 'Driver Conditions',
        hoursOfDay: 'Hours of the Day',
        initdir: 'Initial Direction of Travel',
        impactype: 'Initial Impact Type',
        rdsfcond: 'Weather',
        vehtype: 'Vehicle Type',
        manoeuver: 'Manoeuvre',
      };
      for (let i = 0; i < filters.length; i++) {
        const { filter, label } = filters[i];
        readableFilters.push({
          filter: filtersMap[filter],
          label,
        });
      }
      return readableFilters;
    },
    ...mapGetters('viewData', ['filterChipsCommon', 'filterChipsCollision']),
  },
};
</script>

<style lang="scss">
.callout {
  display: flex;
  align-items: center;
  background-color: #ebf6fe;
  color: black;
  border-radius: 5px;
  min-height: 60px;
  font-size: 14px;
  max-width: 300px;
}

.callout-container {
  display: flex;
  justify-content: flex-end;
}

.tooltip {
  width: 60%;
}

// only show callout button if there's room
@media only screen and (max-width: 800px) {
  .callout {
    display: none !important;
  }
}
</style>
