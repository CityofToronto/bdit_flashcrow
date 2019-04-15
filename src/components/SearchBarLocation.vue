<template>
  <div
    class="search-bar-location"
    :class="{suggestions: suggestionsActive}">
    <b-input-group>
      <b-input-group-prepend>
        <button role="button">
          <b-img
            src="/flashcrow/icons/search-icon.svg"
            width="30"
            height="30"
            alt="Search" />
        </button>
      </b-input-group-prepend>
      <b-form-input
        v-model="query"
        class="input-query"
        size="lg"
        type="text"
        placeholder="Try &quot;Kingston and Lee&quot;"
        @input="onInputQuery" />
    </b-input-group>
    <div v-if="suggestionsActive" class="location-suggestions">
      <div
        v-if="locationSuggestions.length === 0"
        class="location-suggestion disabled">
        No suggestions for <em>{{query}}</em>.
      </div>
      <div
        v-for="suggestion in locationSuggestions"
        :key="suggestion.KEYSTRING"
        class="location-suggestion"
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
.search-bar-location {
  position: relative;
  width: 480px;
  & button {
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 0.3rem 0 0 0.3rem;
    border-right: 0;
    padding: 0 1px 0 6px;
    transition: border-color .15s ease-in-out;
    & > img {
      border-right: 1px solid #ccc;
      transition: border-color .15s ease-in-out;
    }
  }
  & input {
    border-left: none;
    font-family: 'Work Sans';
    font-size: 12pt;
  }
  &:hover {
    button, button > img, input, .location-suggestions {
      border-color: #8c85db;
    }
  }
  & > .location-suggestions {
    background-color: white;
    border: 1px solid #ced4da;
    border-top: none;
    position: absolute;
    top: 38px;
    transition: border-color .15s ease-in-out;
    width: 100%;
    z-index: 99;
    & > .location-suggestion {
      cursor: pointer;
      padding: 4px 8px;
      &.disabled {
        cursor: default;
        color: #444;
      }
      &:not(.disabled):hover {
        background-color: #8c85db33;
      }
    }
  }
}
</style>
