<template>
  <div class="fc-search-bar-location-wrapper">
    <v-autocomplete
      v-if="$route.name !== 'viewReportsAtLocation'"
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
    <v-tooltip
      v-else
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
  watch: {
    location: {
      handler() {
        if (this.location !== null) {
          this.query = this.location.description;
        }
      },
      immediate: true,
    },
    query: debounce(async function processQuery() {
      if (this.location !== null) {
        if (this.query === null) {
          this.query = this.location.description;
          return;
        }
        if (this.query === this.location.description) {
          this.items = [this.location];
          return;
        }
      }
      if (this.query !== null) {
        this.loading = true;
        this.items = await getLocationSuggestions(this.query);
        this.loading = false;
      }
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
