<template>
  <div
    class="search-bar-location"
    :class="{suggestions: locationSuggestions !== null}"
    @keydown.arrow-down="onKeyArrowDown"
    @keydown.arrow-up="onKeyArrowUp"
    @keydown.enter="onKeyEnter"
    @keydown.esc="onKeyEsc">
    <input
      v-model="query"
      class="font-size-l"
      :disabled="disabled"
      type="text"
      placeholder="Try &quot;Kingston and Lee&quot;"
      @input="onInputQuery" />
    <button
      class="clear-location font-size-l"
      :disabled="disabled || location === null"
      @click="onClickClearLocation">
      <i class="fa fa-times-circle"></i>
    </button>
    <div
      v-if="locationSuggestions !== null"
      class="suggestions"
      @mouseleave="activeSuggestion = null">
      <div
        v-if="locationSuggestions.length === 0"
        class="suggestion disabled">
        No suggestions for <em>{{query}}</em>.
      </div>
      <div
        v-for="(suggestion, i) in locationSuggestions"
        :key="suggestion.KEYSTRING"
        class="suggestion"
        :class="{
          'active': activeSuggestion === i,
        }"
        @click="onSelectSuggestion(suggestion)"
        @mouseover="activeSuggestion = i">
        {{suggestion.ADDRESS}}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

import { debounce } from '@/lib/FunctionUtils';

export default {
  name: 'SearchBarLocation',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeSuggestion: null,
      selectedSuggestion: false,
      query: '',
    };
  },
  computed: {
    ...mapState(['location', 'locationSuggestions', 'locationQuery']),
  },
  watch: {
    query: debounce(function fetchQuerySuggestions() {
      if (!this.selectedSuggestion) {
        this.fetchLocationSuggestions(this.query);
      }
    }, 250),
    locationQuery: function onSelectElement() {
      this.selectedSuggestion = true;
      this.query = this.locationQuery;
    },
  },
  methods: {
    onClickClearLocation() {
      this.clearLocation();
    },
    onInputQuery() {
      this.selectedSuggestion = false;
    },
    onKeyArrowDown() {
      if (this.locationSuggestions === null) {
        return;
      }
      const n = this.locationSuggestions.length;
      if (n === 0) {
        return;
      }
      if (this.activeSuggestion === null || this.activeSuggestion === n - 1) {
        this.activeSuggestion = 0;
      } else {
        this.activeSuggestion += 1;
      }
    },
    onKeyArrowUp() {
      if (this.locationSuggestions === null) {
        return;
      }
      const n = this.locationSuggestions.length;
      if (n === 0) {
        return;
      }
      if (this.activeSuggestion === null || this.activeSuggestion === 0) {
        this.activeSuggestion = n - 1;
      } else {
        this.activeSuggestion -= 1;
      }
    },
    onKeyEnter() {
      if (this.locationSuggestions === null || this.locationSuggestions.length === 0) {
        return;
      }
      if (this.activeSuggestion === null) {
        this.activeSuggestion = 0;
      }
      const suggestion = this.locationSuggestions[this.activeSuggestion];
      this.onSelectSuggestion(suggestion);
    },
    onKeyEsc() {
      this.clearLocationSuggestions();
    },
    onSelectSuggestion(suggestion) {
      this.selectedSuggestion = true;
      this.setLocationQuery(suggestion.ADDRESS);
      const keyString = suggestion.KEYSTRING;
      this.fetchLocationByKeyString(keyString);
      this.clearLocationSuggestions();
    },
    ...mapActions([
      'fetchLocationByKeyString',
      'fetchLocationSuggestions',
    ]),
    ...mapMutations(['clearLocation', 'clearLocationSuggestions', 'setLocationQuery']),
  },
};
</script>

<style lang="postcss">
.search-bar-location {
  position: relative;
  & input[type="text"] {
    border-radius: var(--space-s) 0 0 var(--space-s);
    width: 480px;
  }
  & > .clear-location {
    border-radius: 0 var(--space-s) var(--space-s) 0;
  }
  & > .suggestions {
    background-color: var(--base-lightest);
    border: var(--border-default);
    border-top: 0;
    position: absolute;
    top: 34px;
    width: 100%;
    z-index: var(--z-index-search-bar);
    & > .suggestion {
      cursor: pointer;
      padding: var(--space-l) var(--space-m);
      &.active {
        background-color: var(--primary-light);
        color: var(--primary-darker);
      }
      &.disabled {
        color: var(--base);
      }
    }
  }
}
</style>
