<template>
  <b-container fluid class="main home">
    <b-row class="row-nav-secondary pb-2">
      <b-col cols="2">
        <v-datepicker
          v-model="filterDate"
          id="input_delivery_date"
          bootstrap-styling
          :format="datepickerFormat"
          required />
      </b-col>
      <b-col cols="2">
        <v-select
          v-model="filterCountTypes"
          :options="optionsFilterCountTypes"
          multiple
          placeholder="Filter by study type(s)" />
      </b-col>
      <b-col cols="2" offset="6" class="text-right">
        <b-form-checkbox v-model="showMap" name="check-button" switch>
          Show Map
        </b-form-checkbox>
      </b-col>
    </b-row>
    <b-row no-gutters class="row-panes">
      <PaneDisplay />
      <PaneMap v-if="showMap" />
    </b-row>
  </b-container>
</template>

<script>
import PaneDisplay from '@/components/PaneDisplay.vue';
import PaneMap from '@/components/PaneMap.vue';
import Constants from '@/lib/Constants';

export default {
  name: 'Home',
  components: {
    PaneDisplay,
    PaneMap,
  },
  data() {
    return {
      optionsFilterCountTypes: Constants.COUNT_TYPES,
    };
  },
  computed: {
    filterCountTypes: {
      get() {
        return this.$store.state.filterCountTypes;
      },
      set(filterCountTypes) {
        this.$store.commit('setFilterCountTypes', filterCountTypes);
      },
    },
    filterDate: {
      get() {
        return this.$store.state.filterDate;
      },
      set(filterDate) {
        this.$store.commit('setFilterDate', filterDate);
      },
    },
    showMap: {
      get() {
        return this.$store.state.showMap;
      },
      set(showMap) {
        this.$store.commit('setShowMap', showMap);
      },
    },
  },
  methods: {
    datepickerFormat(d) {
      // TODO: DRY with main.js Vue filter
      if (!d) {
        return '';
      }
      return new Intl.DateTimeFormat('en-US').format(d);
    },
  },
};
</script>

<style lang="postcss">
.home {
  display: flex;
  flex-direction: column;
  & > .row-nav-secondary {
    background-color: #fafafa;
  }
  & > .row-panes {
    flex-grow: 1;
    margin-left: -15px;
    margin-right: -15px;
  }
}
</style>
