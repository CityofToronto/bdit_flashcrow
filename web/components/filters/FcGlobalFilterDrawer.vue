<template>
  <v-navigation-drawer
    v-model="internalValue"
    absolute
    class="fc-global-filter-drawer"
    right
    temporary
    :width="280">
    <div
      ref="content"
      class="d-flex fill-height flex-column">
      <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-4 py-3 shading">
        <h2 class="display-1">Filter</h2>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </div>

      <v-divider></v-divider>

      <div class="flex-grow-1 flex-shrink-1">
        <div class="fc-global-filters-panel px-6 py-4">
          TODO: common filters
        </div>
        <v-expansion-panels
          v-model="indexOpen"
          accordion
          flat
          focusable>
          <v-expansion-panel
            v-if="internalFiltersCollision !== null"
            class="fc-global-filters-panel">
            <v-expansion-panel-header>
              <span class="body-1">Collisions</span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <FcCollisionFilters
                v-model="internalFiltersCollision" />
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel
            v-if="internalFiltersStudy !== null"
            class="fc-global-filters-panel">
            <v-expansion-panel-header>
              <span class="body-1">Studies</span>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <FcStudyFilters
                v-model="internalFiltersStudy" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <v-divider></v-divider>

      <div class="d-flex flex-grow-0 flex-shrink-0 overflow-y-auto px-4 py-2 shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          Cancel
        </FcButton>
        <FcButton
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import FcCollisionFilters from '@/web/components/filters/FcCollisionFilters.vue';
import FcStudyFilters from '@/web/components/filters/FcStudyFilters.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcGlobalFilterDrawer',
  mixins: [
    FcMixinVModelProxy(Boolean),
  ],
  components: {
    FcButton,
    FcCollisionFilters,
    FcStudyFilters,
  },
  data() {
    return {
      indexOpen: null,
      internalFiltersCollision: null,
      internalFiltersStudy: null,
      previousActiveElement: null,
    };
  },
  computed: {
    ...mapState('viewData', ['filtersCollision', 'filtersStudy']),
  },
  watch: {
    internalValue() {
      if (this.internalValue) {
        this.show();
      } else {
        this.unbind();
        this.indexOpen = null;
        if (this.previousActiveElement !== null) {
          this.previousActiveElement.focus();
        }
      }
    },
  },
  beforeDestroy() {
    this.unbind();
  },
  methods: {
    actionClearAll() {
      this.internalFiltersCollision = {
        applyDateRange: false,
        dateRangeStart: null,
        dateRangeEnd: null,
        daysOfWeek: [],
        emphasisAreas: [],
        hoursOfDay: [0, 24],
        roadSurfaceConditions: [],
      };
      this.internalFiltersStudy = {
        applyDateRange: false,
        dateRangeStart: null,
        dateRangeEnd: null,
        daysOfWeek: [],
        hours: [],
        studyTypes: [],
      };
    },
    actionSave() {
      this.setFiltersCollision(this.internalFiltersCollision);
      this.setFiltersStudy(this.internalFiltersStudy);
      this.internalValue = false;
    },
    /*
     * These methods ensure that focus is trapped within the navigation drawer.  This
     * implementation is borrowed from `<v-dialog>`, which also relies on focus-trapping;
     * unfortunately, Vuetify does not make that functionality available to other
     * components.
     */
    bind() {
      window.addEventListener('focusin', this.onFocusin);
    },
    onFocusin(evt) {
      if (!evt) {
        return;
      }
      const { target } = evt;
      if (
        !!target
        // It isn't the document or the dialog body
        && ![document, this.$refs.content].includes(target)
        // It isn't inside the dialog body
        && !this.$refs.content.contains(target)
      ) {
        // Find and focus the first available element inside the dialog
        const focusable = this.$refs.content.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const el = [...focusable].find(elFocusable => !elFocusable.hasAttribute('disabled'));
        if (el) {
          el.focus();
        }
      }
    },
    show() {
      this.internalFiltersCollision = {
        ...this.filtersCollision,
        hoursOfDay: [...this.filtersCollision.hoursOfDay],
      };
      this.internalFiltersStudy = {
        ...this.filtersStudy,
      };

      // Double nextTick to wait for lazy content to be generated
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.previousActiveElement = document.activeElement;
          this.$refs.content.focus();
          this.bind();
        });
      });
    },
    unbind() {
      window.removeEventListener('focusin', this.onFocusin);
    },
    ...mapMutations('viewData', [
      'setFiltersCollision',
      'setFiltersStudy',
    ]),
  },
};
</script>

<style lang="scss">
.fc-global-filter-drawer.v-navigation-drawer--temporary {
  z-index: 400;

  & .fc-global-filters-panel {
    border-bottom: 1px solid var(--v-border-base);
  }
}
</style>
