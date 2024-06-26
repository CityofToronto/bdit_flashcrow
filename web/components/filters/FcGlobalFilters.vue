<template>
  <section
    :aria-labelledby="headingId"
    class="fc-global-filters default--text">
    <div class="align-center d-flex">
      <component
        :is="headerTag"
        class="headline mr-1 filter-title" :id="headingId">
        Filters
      </component>
      <v-spacer></v-spacer>

      <v-tooltip right>
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-if="!readonly"
            width="40px"
            min-width="40px"
            aria-label="Add Data Filters"
            type="tertiary" v-bind="attrs" v-on="on"
            @click="setFiltersOpen(true)">
            <v-icon>mdi-plus</v-icon>
          </FcButton>
        </template>
        <span>Add Data Filters</span>
      </v-tooltip>

    </div>
    <div
      v-if="filterChipsCommon.length > 0"
      class="align-center d-flex mt-2 mb-2">
      <FcListFilterChips
        @click-filter="actionRemoveFilterCommon"
        :filter-chips="filterChipsCommon"
        :max-width="250"
        :readonly="readonly" />
    </div>
    <div
      v-if="filterChipsCollision.length > 0"
      class="align-center d-flex mt-4 mb-2">
      <span class="body-1 flex-grow-0 flex-shrink-0 secondary--text filter-name">
        Collisions:
      </span>
      <FcListFilterChips
        class="ml-1"
        @click-filter="actionRemoveFilterCollision"
        :filter-chips="filterChipsCollision"
        :max-width="250"
        :readonly="readonly" />
    </div>
    <div
      v-if="filterChipsStudy.length > 0"
      class="align-center d-flex mt-4 mb-2">
      <span class="body-1 flex-grow-0 flex-shrink-0 secondary--text filter-name">
        Studies:
      </span>
      <FcListFilterChips
        class="ml-1"
        @click-filter="actionRemoveFilterStudy"
        :filter-chips="filterChipsStudy"
        :max-width="250"
        :readonly="readonly" />
    </div>
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

import FcListFilterChips from '@/web/components/filters/FcListFilterChips.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

let HEADING_ID_SUFFIX = 0;

export default {
  name: 'FcGlobalFilters',
  components: {
    FcButton,
    FcListFilterChips,
  },
  props: {
    headerTag: {
      type: String,
      default: 'h2',
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const suffix = HEADING_ID_SUFFIX;
    const headingId = `heading_global_filters_${suffix}`;
    HEADING_ID_SUFFIX += 1;
    return {
      headingId,
    };
  },
  computed: {
    ...mapGetters('viewData', [
      'filterChipsCollision',
      'filterChipsCommon',
      'filterChipsStudy',
      'hasFilters',
    ]),
  },
  methods: {
    actionRemoveFilterCollision(filter) {
      this.removeFilterCollision(filter);
      this.setToastInfo(`Removed collision filter: ${filter.label}.`);
    },
    actionRemoveFilterCommon(filter) {
      this.removeFilterCommon(filter);
      this.setToastInfo(`Removed filter: ${filter.label}.`);
    },
    actionRemoveFilterStudy(filter) {
      this.removeFilterStudy(filter);
      this.setToastInfo(`Removed study filter: ${filter.label}.`);
    },
    ...mapMutations(['setFiltersOpen', 'setToastInfo']),
    ...mapMutations('viewData', [
      'removeFilterCollision',
      'removeFilterCommon',
      'removeFilterStudy',
    ]),
  },
};
</script>

<style lang="scss">
.fc-global-filters {
  .filter-name {
    align-self: flex-start;
    margin-right: 15px;
  }
  .filter-title {
    user-select: none;
  }
}
</style>
