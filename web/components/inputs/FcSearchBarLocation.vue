<template>
  <div class="fc-search-bar-location-wrapper">
    <v-autocomplete
      v-if="$route.name !== 'viewReportsAtLocation'"
      v-model="keystring"
      append-icon="mdi-magnify"
      autofocus
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
    <template v-else>
      <FcDialogConfirm
        v-model="showConfirmLeave"
        textCancel="Stay on this page"
        textOk="Leave"
        title="Leave Reports"
        @action-ok="actionLeave">
        <span class="body-1">
          Leaving this page will cause you to switch to another location.
          Are you sure you want to leave?
        </span>
      </FcDialogConfirm>
      <v-tooltip
        right
        :z-index="100">
        <template v-slot:activator="{ on }">
          <FcButton
            aria-label="Search for new location"
            class="fc-search-bar-open"
            type="fab-text"
            @click="showConfirmLeave = true"
            v-on="on">
            <v-icon>mdi-magnify</v-icon>
          </FcButton>
        </template>
        <span>Search for new location</span>
      </v-tooltip>
    </template>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import { debounce } from '@/lib/FunctionUtils';
import { getLocationByKeyString, getLocationSuggestions } from '@/lib/api/WebApi';
import FcDialogConfirm from '@/web/components/dialogs/FcDialogConfirm.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcSearchBarLocation',
  components: {
    FcButton,
    FcDialogConfirm,
  },
  data() {
    return {
      keystring: null,
      items: [],
      loading: false,
      query: null,
      showConfirmLeave: false,
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
    actionLeave() {
      this.$router.push({ name: 'viewData' });
    },
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
