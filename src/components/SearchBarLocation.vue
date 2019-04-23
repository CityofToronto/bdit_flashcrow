<template>
  <div
    class="search-bar search-bar-location"
    :class="{suggestions: suggestionsActive}">
    <div class="input-group">
      <img
        src="/flashcrow/icons/search-icon.svg"
        alt="Search" />
      <input
        v-model="query"
        class="input-query"
        type="text"
        placeholder="Try &quot;Kingston and Lee&quot;"
        @input="onInputQuery" />
    </div>
    <div v-if="suggestionsActive" class="suggestions">
      <div
        v-if="locationSuggestions.length === 0"
        class="suggestion disabled">
        No suggestions for <em>{{query}}</em>.
      </div>
      <div
        v-for="suggestion in locationSuggestions"
        :key="suggestion.KEYSTRING"
        class="suggestion"
        @click="onSelectSuggestion(suggestion)">
        {{suggestion.ADDRESS}}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';

function debounce(func, wait) {
  let timeout;
  return function debounceWrapper(...args) {
    const context = this;
    const later = function later() {
      timeout = null;
      func.apply(context, args);
    };
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    if (!timeout) {
      func.apply(context, args);
    }
  };
}

export default {
  name: 'SearchBarLocation',
  data() {
    return {
      selectedSuggestion: false,
      query: '',
    };
  },
  computed: {
    suggestionsActive() {
      return this.locationSuggestions !== null;
    },
    ...mapState(['location', 'locationSuggestions']),
  },
  watch: {
    query: debounce(function fetchQuerySuggestions() {
      if (!this.selectedSuggestion) {
        this.fetchLocationSuggestions(this.query);
      }
    }, 250),
  },
  methods: {
    onInputQuery() {
      this.selectedSuggestion = false;
    },
    onSelectSuggestion(suggestion) {
      this.selectedSuggestion = true;
      this.query = suggestion.ADDRESS;
      const keyString = suggestion.KEYSTRING;
      this.fetchLocation(keyString);
      this.clearLocationSuggestions();
    },
    ...mapActions(['fetchLocation', 'fetchLocationSuggestions']),
    ...mapMutations(['clearLocation', 'clearLocationSuggestions']),
  },
};
</script>

<style lang="postcss">
.search-bar {
  position: relative;
  & button {
    background-color: var(--white);
    border: 1px solid var(--outline-grey);
    border-right: 0;
    padding: 0 1px 0 6px;
    transition: border-color var(--transition-short) ease-in-out;
    & > img {
      border-right: 1px solid var(--outline-grey);
      transition: border-color var(--transition-short) ease-in-out;
    }
  }
  & input {
    width: 320px;
  }
  & > .suggestions {
    background-color: var(--white);
    border: 1px solid var(--outline-grey);
    border-top: 0;
    position: absolute;
    top: 31px;
    width: 100%;
    z-index: var(--z-index-controls);
    & > .suggestion {
      cursor: pointer;
      padding: var(--sp) calc(var(--sp) * 2);
      &:hover {
        background-color: var(--light-blue);
        color: var(--blue);
      }
      &.disabled, &.disabled:hover {
        cursor: not-allowed;
        color: var(--outline-grey);
      }
    }
  }
}
</style>
