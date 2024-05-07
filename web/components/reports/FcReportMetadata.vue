<template>
  <div>
  <v-row class="mb-6" tag="dl">
    <v-col
      v-for="({ cols, name, value }, i) in entries"
      :key="i"
      :cols="cols">
      <dt class="subtitle-1 font-weight-medium">{{name}}</dt>
      <dd class="mt-1 display-1 font-weight-medium">
        <FcTextReportValue
          text-null="None"
          :value="value" />
      </dd>
    </v-col>
  </v-row>

  <div v-if="collisionFilters.length > 0">
    <h3>Collision Filters</h3>
    <ul>
      <li v-for="(item, i) in collisionFilters" :key="i">
        <b>{{ item.filter }}: </b> {{ item.label }}
      </li>
    </ul>
  </div>

  <div class="callout-container" v-if="this.showCallOut">
    <div class="callout ma-3">
      <div class="ma-3">
        <v-icon color="blue">mdi-information</v-icon>
      </div>
      <div class="ml-1 mr-2 pr-2 py-2">
        For an in-depth explanation of how to interpret this data,
        <a class="link" href="https://bditto.notion.site/How-to-interpret-a-TMC-Summary-Report-310c8b7e9ca74b18b99aadc50dc27196" target="_blank" rel="noopener noreferrer">
          see here
        </a>
      </div>
    </div>
  </div>

</div>
</template>

<script>
import { mapGetters } from 'vuex';
import FcTextReportValue from '@/web/components/data/FcTextReportValue.vue';

export default {
  name: 'FcReportMetadata',
  components: {
    FcTextReportValue,
  },
  props: {
    entries: Array,
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
  },
  methods: {
    readableFilters(filters) {
      const readableFilters = [];
      for (let i = 0; i < filters.length; i++) {
        const { filter, label } = filters[i];
        let newFilter = '';

        if (filter === 'validated') {
          newFilter = 'Verification';
        } else if (filter === 'daysOfWeek') {
          newFilter = 'Days of the Week';
        } else if (filter === 'details') {
          newFilter = 'Collision Details';
        } else if (filter === 'emphasisAreas') {
          newFilter = 'Vision Zero Emphasis Areas';
        } else if (filter === 'mvcr') {
          newFilter = 'MVCR';
        } else if (filter === 'injury') {
          newFilter = 'Injuries';
        } else if (filter === 'drivact') {
          newFilter = 'Driver Action';
        } else if (filter === 'drivcond') {
          newFilter = 'Driver Conditions';
        } else if (filter === 'hoursOfDay') {
          newFilter = 'Hours of the Day';
        } else if (filter === 'impactype') {
          newFilter = 'Initial Impact Type';
        } else if (filter === 'initdir') {
          newFilter = 'Initial Direction of Travel';
        } else if (filter === 'rdsfcond') {
          newFilter = 'Weather';
        } else if (filter === 'vehtype') {
          newFilter = 'Vehicle Type';
        } else if (filter === 'manoeuver') {
          newFilter = 'Manoeuvre';
        }
        readableFilters.push({
          filter: newFilter,
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

// only show callout button if there's room
@media only screen and (max-width: 800px) {
  .callout {
    display: none !important;
  }
}

</style>
