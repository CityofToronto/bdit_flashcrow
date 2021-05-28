<template>
  <div class="fc-input-location-search">
    <v-menu
      v-model="showLocationSuggestions"
      ref="menuLocationSuggestions"
      :attach="$el"
      :close-on-click="false"
      :close-on-content-click="false"
      :offset-y="true"
      :open-on-click="false">
      <template v-slot:activator="{ attrs: attrsMenu, on: onMenu }">
        <div v-bind="attrsMenu">
          <v-text-field
            v-model="query"
            :aria-label="query"
            autocomplete="off"
            dense
            :flat="hasLocationIndex"
            hide-details
            label="Choose location or click on the map"
            :loading="loading"
            solo
            v-bind="$attrs"
            @blur="actionBlur"
            @focus="actionFocus"
            @input="actionInput"
            v-on="onMenu">
            <template v-slot:append>
              <template v-if="hasLocationIndex">
                <FcIconLocationMulti
                  v-if="!hasLocationToAddIndex"
                  :location-index="locationIndex"
                  :selected="selected" />
                <span v-else>&nbsp;</span>
              </template>
              <template v-else>
                <FcTooltip
                  v-if="internalValue !== null || query !== null"
                  right>
                  <template v-slot:activator="{ on: onTooltip }">
                    <FcButton
                      aria-label="Clear Location"
                      class="mr-1"
                      type="icon"
                      @click="actionClear"
                      v-on="onTooltip">
                      <v-icon>mdi-close-circle</v-icon>
                    </FcButton>
                  </template>
                  <span>Clear Location</span>
                </FcTooltip>
                <v-divider vertical />
                <v-icon
                  :color="hasFocus ? 'primary' : null"
                  right>
                  mdi-magnify
                </v-icon>
              </template>
            </template>
          </v-text-field>
        </div>
      </template>
      <v-list
        ref="listLocationSuggestions"
        class="fc-list-location-suggestions">
        <v-list-item
          v-for="(location, i) in locationSuggestions"
          :key="i"
          @click="actionSelect(location)">
          <v-list-item-content>
            <v-list-item-title>
              <span>{{location.description}}</span>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import { Enum } from '@/lib/ClassUtils';
import { debounce } from '@/lib/FunctionUtils';
import { getLocationSuggestions } from '@/lib/api/WebApi';
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcIconLocationMulti from '@/web/components/location/FcIconLocationMulti.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

class LocationSearchState extends Enum {}
LocationSearchState.init([
  'VALUE_EMPTY',
  'QUERY_TYPING',
  'QUERY_SENT',
  'SUGGESTIONS_RECEIVED',
  'VALUE_SELECTED',
]);

export default {
  name: 'FcInputLocationSearch',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcButton,
    FcIconLocationMulti,
    FcTooltip,
  },
  props: {
    locationIndex: {
      type: Number,
      default: null,
    },
    selected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const query = this.value === null ? null : this.value.description;
    const state = this.value === null
      ? LocationSearchState.VALUE_EMPTY
      : LocationSearchState.VALUE_SELECTED;
    return {
      hasFocus: false,
      loading: false,
      locationSuggestions: [],
      query,
      state,
    };
  },
  computed: {
    hasLocationIndex() {
      return this.locationIndex !== null;
    },
    hasLocationToAddIndex() {
      return this.locationIndex === -1;
    },
    showLocationSuggestions: {
      get() {
        return this.hasFocus
          && this.locationSuggestions.length > 0
          && this.state === LocationSearchState.SUGGESTIONS_RECEIVED;
      },
      set(showLocationSuggestions) {
        /*
         * When the suggestions box is open and the user hits the Esc key, Vuetify sets
         * the `<v-menu>` value to `false` - so we have to provide a setter here.
         */
        if (!showLocationSuggestions) {
          this.hasFocus = false;
        }
      },
    },
  },
  watch: {
    internalValue() {
      if (this.internalValue !== null) {
        this.query = this.internalValue.description;
        this.state = LocationSearchState.VALUE_SELECTED;
      }
    },
    query: debounce(async function processQuery() {
      if (this.state !== LocationSearchState.QUERY_TYPING) {
        return;
      }
      this.loading = true;
      this.state = LocationSearchState.QUERY_SENT;
      const { query } = this;
      const locationSuggestions = await getLocationSuggestions(query, {});
      if (this.state !== LocationSearchState.QUERY_SENT) {
        return;
      }
      this.locationSuggestions = locationSuggestions;
      this.loading = false;
      this.state = LocationSearchState.SUGGESTIONS_RECEIVED;

      const event = this.$analytics.locationSearchEvent(query, locationSuggestions.length);
      await this.$analytics.send([event]);
    }, 200),
    showLocationSuggestions() {
      if (this.showLocationSuggestions) {
        this.$refs.menuLocationSuggestions.$el.focus();
      }
    },
    state() {
      if (this.state === LocationSearchState.VALUE_SELECTED) {
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
            * The user just selected a location, either via the autocomplete dropdown or
            * via map interaction.  We need to update the search bar to match.
            */
          this.query = this.internalValue.description;
        }
      }
    },
  },
  methods: {
    actionClear() {
      this.internalValue = null;
      this.locationSuggestions = [];
      this.query = null;
      this.state = LocationSearchState.VALUE_EMPTY;
      if (this.hasLocationIndex && !this.hasLocationToAddIndex) {
        this.$emit('location-remove', this.locationIndex);
      }
    },
    actionBlur(e) {
      /*
       * Clicking a location suggestion in the dropdown triggers a blur event.  However, if
       * we set `this.hasFocus = false` immediately, the dropdown disappears before the `@click`
       * handler is processed.
       *
       * By detecting this case here, we allow the state transition to
       * `LocationSearchState.VALUE_SELECTED` within `actionSelect` to hide the dropdown instead,
       * after the `@click` handler is processed.
       */
      const { relatedTarget: $relatedTarget } = e;
      if ($relatedTarget !== null) {
        const $list = $relatedTarget.closest('.fc-list-location-suggestions');
        /*
         * From the [lifecycle diagram](https://vuejs.org/v2/guide/instance.html#Lifecycle-Diagram),
         * child components are created after the parent.  Until the `<v-list>` component is
         * created, `this.$refs.listLocationSuggestions` is undefined, and since `blur` can
         * trigger pretty early on in the lifecycle we check for that here.
         */
        if (this.$refs.listLocationSuggestions !== undefined
          && $list === this.$refs.listLocationSuggestions.$el) {
          return;
        }
      }
      if (this.internalValue !== null) {
        this.query = this.internalValue.description;
      }
      this.hasFocus = false;
    },
    actionFocus() {
      this.hasFocus = true;
      this.$emit('focus');
    },
    actionInput() {
      if (this.query === '') {
        this.actionClear();
      } else {
        this.state = LocationSearchState.QUERY_TYPING;
      }
    },
    actionSelect(location) {
      this.internalValue = location;
      this.state = LocationSearchState.VALUE_SELECTED;
    },
  },
};
</script>

<style lang="scss">
.fc-input-location-search {
  & > .v-input--is-focused {
    box-shadow: 0 0 0 2px var(--v-primary-base);
  }
  &.v-select .v-input__append-inner .v-input__icon--append .v-icon {
    margin-top: 0;
  }
  &.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
    transform: none;
  }
}
</style>
