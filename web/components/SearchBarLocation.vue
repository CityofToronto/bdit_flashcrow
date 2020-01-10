<template>
  <v-toolbar
    class="search-bar-location"
    dark
    color="teal">
    <v-autocomplete
      v-model="keystring"
      cache-items
      class="mx-4"
      flat
      hide-no-data
      hide-details
      :items="items"
      item-text="ADDRESS"
      item-value="KEYSTRING"
      label="Search"
      :loading="loading"
      prepend-icon="mdi-map-search-outline"
      :search-input.sync="query" />
  </v-toolbar>
</template>

<script>
import { debounce } from '@/lib/FunctionUtils';
import { getLocationByKeyString, getLocationSuggestions } from '@/lib/api/WebApi';

export default {
  name: 'SearchBarLocation',
  props: {
    value: Object,
  },
  data() {
    return {
      keystring: null,
      items: [],
      loading: false,
      query: '',
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  watch: {
    query: debounce(async function processQuery() {
      this.loading = true;
      this.items = await getLocationSuggestions(this.query);
      this.loading = false;
    }, 250),
    async keystring() {
      if (this.keystring === null) {
        this.internalValue = null;
        return;
      }
      this.loading = true;
      this.internalValue = await getLocationByKeyString(this.keystring);
      this.loading = false;
    },
  },
};
</script>
