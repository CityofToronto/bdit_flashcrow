<template>
  <div class="fc-selector-multi-location d-flex flex-column pa-5 shading">
    <div class="align-start d-flex flex-grow-1 flex-shrink-1">
      <div class="fc-input-location-search-wrapper elevation-2">
        <FcInputLocationSearch
          v-for="(_, i) in locations"
          :key="'search_' + i"
          v-model="locations[i]"
          :location-index="i" />
        <FcInputLocationSearch
          v-if="locations.length < 5"
          v-model="locationToAdd"
          :location-index="-1"
          @location-add="actionAddLocation" />
      </div>
      <div class="ml-2">
        <div
          v-for="(_, i) in locations"
          :key="'remove_' + i"
          class="fc-input-location-search-remove">
          <FcButton
            type="icon"
            @click="actionRemoveLocation(i)">
            <v-icon>mdi-close</v-icon>
          </FcButton>
        </div>
      </div>
    </div>
    <div class="flex-grow-0 flex-shrink-0">
      <h1
        class="display-3 mb-4"
        :title="description">
        <span
          v-if="locations.length === 0"
          class="secondary--text">
          No locations selected
        </span>
        <span v-else>
          {{description}}
        </span>
      </h1>
      <div class="d-flex align-center">
        <v-checkbox
          v-model="corridor"
          class="fc-multi-location-corridor mt-0"
          hide-details
          label="Include intersections and midblocks between locations" />
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary">
          Cancel
        </FcButton>
        <FcButton
          :disabled="locations.length === 0"
          type="secondary">
          Done
        </FcButton>
      </div>
    </div>
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcInputLocationSearch from '@/web/components/inputs/FcInputLocationSearch.vue';

export default {
  name: 'FcSelectorMultiLocation',
  components: {
    FcButton,
    FcInputLocationSearch,
  },
  data() {
    return {
      corridor: false,
      locationToAdd: null,
      locations: [],
    };
  },
  computed: {
    description() {
      const n = this.locations.length;
      if (n === 0) {
        return null;
      }
      const [{ description }] = this.locations;
      if (n === 1) {
        return description;
      }
      if (n === 2) {
        return `${description} + 1 location`;
      }
      return `${description} + ${n - 1} locations`;
    },
  },
  methods: {
    actionAddLocation(location) {
      this.locations.push(location);
    },
    actionRemoveLocation(i) {
      this.locations.splice(i, 1);
    },
  },
};
</script>

<style lang="scss">
.fc-selector-multi-location {
  border-radius: 8px;
  height: 387px;
  width: 664px;

  & .fc-input-location-search-wrapper {
    width: 472px;
    & > .fc-input-location-search {
      &:not(:first-child) {
        border-top: 1px solid var(--v-border-base);
      }
    }
  }
  & .fc-input-location-search-remove {
    height: 39px;
  }

  & .fc-multi-location-corridor {
    & .v-label {
      font-size: 0.875rem;
    }
  }
}
</style>
