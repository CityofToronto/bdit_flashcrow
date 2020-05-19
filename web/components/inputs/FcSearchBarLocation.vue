<template>
  <div class="fc-search-bar-location-wrapper">
    <v-tooltip
      v-if="collapseSearchBar"
      right
      :z-index="100">
      <template v-slot:activator="{ on }">
        <FcButton
          aria-label="Search for new location"
          class="fc-search-bar-open"
          type="fab-text"
          @click="$router.push({ name: 'viewData' })"
          v-on="on">
          <v-icon class="unselected--text">mdi-magnify</v-icon>
        </FcButton>
      </template>
      <span>Search for new location</span>
    </v-tooltip>
    <v-autocomplete
      v-else
      v-model="internalLocation"
      append-icon="mdi-magnify"
      class="fc-search-bar-location elevation-2"
      dense
      hide-details
      hide-no-data
      :items="items"
      item-text="description"
      label="Search"
      :loading="loading"
      no-filter
      return-object
      :search-input.sync="query"
      solo>
      <template v-slot:item="{ attrs, item, on, parent }">
        <v-list-item
          v-bind="attrs"
          v-on="on">
          <v-list-item-content>
            <v-list-item-title>
              <span>{{item[parent.itemText]}}</span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import { debounce } from '@/lib/FunctionUtils';
import { getLocationSuggestions } from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcSearchBarLocation',
  components: {
    FcButton,
  },
  data() {
    return {
      items: [],
      key: null,
      loading: false,
      query: null,
    };
  },
  computed: {
    collapseSearchBar() {
      const { name } = this.$route;
      return name === 'viewCollisionReportsAtLocation'
        || name === 'viewStudyReportsAtLocation';
    },
    internalLocation: {
      get() {
        return this.location;
      },
      set(internalLocation) {
        this.setLocation(internalLocation);
      },
    },
    ...mapState(['location']),
  },
  /*
   * To understand the following watchers, imagine a state machine:
   *
   * 1. selected location...
   *   a. empty query
   *   b. query that matches location
   *   c. query that doesn't match location
   * 2. no selected location...
   *   a. empty query
   *   b. non-empty query
   *
   * Transitions between these are explained below.
   */
  watch: {
    location: {
      handler() {
        if (this.location !== null) {
          /*
           * 1c -> 1b: the user just selected a location, either via the autocomplete
           * dropdown or via map interaction.  We need to update the search bar to match.
           */
          this.query = this.location.description;
        }
      },
      immediate: true,
    },
    query: debounce(async function processQuery() {
      if (this.location !== null) {
        if (this.query === null) {
          /*
           * 1a -> 1b: a new search bar instance was just loaded, and we already have a
           * selected location.  We need to update the search bar to match.
           *
           * While setting a value in its own watcher is unusual, we can avoid infinite
           * recursion by moving through the state machine.
           */
          this.query = this.location.description;
          return;
        }
        if (this.query === this.location.description) {
          /*
           * 1b: `<v-autocomplete>` gets confused if the list of items doesn't contain
           * the `v-model` value, so we make a special items list with the selected
           * location to un-confuse it.
           */
          this.items = [this.location];
          return;
        }
        /*
         * 1c: we already have a selected location, but the user is currently typing
         * a new query...
         */
      }
      if (this.query !== null) {
        /*
         * 1c / 2b: the user is currently typing a query.  We need to fetch suggested
         * locations for that query.
         *
         * Once the user selects a suggested location, `location` is updated, triggering
         * the location watcher to move us into 1b.
         */
        this.loading = true;
        this.items = await getLocationSuggestions(this.query);
        this.loading = false;
      }
      /*
       * 2a: there is no selected location, and no query to search for.  Do nothing.
       */
    }, 250),
  },
  methods: {
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-search-bar-location-wrapper {
  & > .fc-search-bar-location {
    width: 392px;
    &.v-select .v-input__append-inner .v-input__icon--append .v-icon {
      margin-top: 0;
    }
    &.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
      transform: none;
    }
  }

  & > button.fc-button.v-btn.fc-search-bar-open {
    min-width: 36px;
    width: 36px;
  }
}
</style>
