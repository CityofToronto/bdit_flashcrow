<template>
  <v-autocomplete
    v-model="internalValue"
    class="fc-input-location-search"
    dense
    :flat="hasLocationIndex"
    hide-details
    hide-no-data
    :items="items"
    item-text="description"
    label="Choose location or click on the map"
    :loading="loading"
    no-filter
    return-object
    :search-input.sync="query"
    solo
    v-on="$listeners">
    <template v-slot:append>
      <span v-if="hasLocationIndex">&nbsp;</span>
      <template v-else>
        <v-tooltip
          v-if="internalValue !== null || query !== null"
          right>
          <template v-slot:activator="{ on }">
            <FcButton
              aria-label="Clear Location"
              class="mr-1"
              type="icon"
              @click="actionClear"
              v-on="on">
              <v-icon>mdi-close-circle</v-icon>
            </FcButton>
          </template>
          <span>Clear Location</span>
        </v-tooltip>
        <v-divider vertical />
        <v-icon right>mdi-magnify</v-icon>
      </template>
    </template>
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
</template>

<script>
import { debounce } from '@/lib/FunctionUtils';
import { getLocationSuggestions } from '@/lib/api/WebApi';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcInputLocationSearch',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
  },
  props: {
    locationIndex: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      items: [],
      loading: false,
      query: null,
    };
  },
  computed: {
    hasLocationIndex() {
      return this.locationIndex !== null;
    },
    hasLocationToAddIndex() {
      return this.locationIndex === -1;
    },
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
    internalValue: {
      handler() {
        if (this.internalValue !== null) {
          if (this.hasLocationToAddIndex) {
            /*
             * In this case, the user has just selected a location to be added to the
             * multi-location selection.  We need to pass that new location up, then
             * clear the search bar state - the parent component can't clear it for us,
             * and we're reusing the same search bar for the next new location.
             */
            this.$emit('location-add', this.internalValue);
            this.actionClear();
          } else {
            /*
             * 1c -> 1b: the user just selected a location, either via the autocomplete
             * dropdown or via map interaction.  We need to update the search bar to match.
             */
            this.query = this.internalValue.description;
          }
        }
      },
      immediate: true,
    },
    query: debounce(async function processQuery() {
      if (this.internalValue !== null) {
        if (this.query === null) {
          /*
           * 1a -> 1b: a new search bar instance was just loaded, and we already have a
           * selected location.  We need to update the search bar to match.
           *
           * While setting a value in its own watcher is unusual, we can avoid infinite
           * recursion by moving through the state machine.
           */
          this.query = this.internalValue.description;
          return;
        }
        if (this.query === this.internalValue.description) {
          /*
           * 1b: `<v-autocomplete>` gets confused if the list of items doesn't contain
           * the `v-model` value, so we make a special items list with the selected
           * location to un-confuse it.
           */
          this.items = [this.internalValue];
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
        this.items = await getLocationSuggestions(this.query, {});
        this.loading = false;
      }
      /*
       * 2a: there is no selected location, and no query to search for.  Do nothing.
       */
    }, 250),
  },
  methods: {
    actionClear() {
      this.items = [];
      /*
       * 1b -> 1a -> 2a.  The debounce delay of 250ms on the `query` watcher is more than
       * enough so that, by the time it fires, we're already in 2a.
       */
      this.query = null;
      this.internalValue = null;
    },
  },
};
</script>

<style lang="scss">
.fc-input-location-search {
  &.v-select .v-input__append-inner .v-input__icon--append .v-icon {
    margin-top: 0;
  }
  &.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
    transform: none;
  }
}
</style>
