<template>
  <div class="search-bar-location">
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
        placeholder="Try &quot;Kingston and Lee&quot;" />
    </b-input-group>
  </div>
</template>

<script>
export default {
  name: 'SearchBarLocation',
  computed: {
    query: {
      get() {
        return this.$store.state.query;
      },
      set(query) {
        this.$store.commit('setQuery', query);
      },
    },
  },
};
</script>

<style lang="postcss">
.search-bar-location {
  width: 500px;
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
    button, button > img, input {
      border-color: #8c85db;
    }
  }
}
</style>
