<template>
  <v-autocomplete
    v-model="keystring"
    append-icon="mdi-magnify"
    cache-items
    class="fc-search-bar-location elevation-2"
    dense
    hide-no-data
    hide-details
    :items="items"
    item-text="ADDRESS"
    item-value="KEYSTRING"
    label="Search"
    :loading="loading"
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
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import { debounce } from '@/lib/FunctionUtils';
import { getLocationByKeyString, getLocationSuggestions } from '@/lib/api/WebApi';

export default {
  name: 'FcSearchBarLocation',
  data() {
    return {
      keystring: null,
      items: [],
      loading: false,
      query: null,
    };
  },
  computed: {
    internalLocation: {
      get() {
        return this.location;
      },
      set(location) {
        this.setLocation(location);
      },
    },
    ...mapState(['location']),
  },
  watch: {
    query: debounce(async function processQuery() {
      if (this.query === null) {
        this.internalLocation = null;
        return;
      }
      this.loading = true;
      this.items = await getLocationSuggestions(this.query);
      this.loading = false;
    }, 250),
    async keystring() {
      if (this.keystring === null) {
        this.internalLocation = null;
        return;
      }
      this.loading = true;
      this.internalLocation = await getLocationByKeyString(this.keystring);
      this.loading = false;
    },
  },
  methods: {
    ...mapMutations(['setLocation']),
  },
};
</script>

<style lang="scss">
.fc-search-bar-location {
  width: 392px;
  &.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
    transform: none;
  }
}
</style>
