<template>
  <section
    :aria-labelledby="headingId"
    class="fc-global-filters default--text">
    <div class="align-center d-flex">
      <component
        :is="headerTag"
        class="headline" :id="headingId">
        Filters
      </component>
      <v-spacer></v-spacer>
      <FcButton
        v-if="!readonly"
        type="tertiary"
        @click="setFiltersOpen(true)">
        Edit
      </FcButton>
    </div>
    <div v-if="!hasFilters" class="secondary--text">
      No active filters
    </div>
    <div
      v-if="filterChipsCommon.length > 0"
      class="align-center d-flex mt-2">
      <FcListFilterChips
        @click-filter="actionRemoveFilterCommon"
        :filter-chips="filterChipsCommon"
        :max-width="320"
        :readonly="readonly" />
    </div>
    <div
      v-if="filterChipsCollision.length > 0"
      class="align-center d-flex mt-2">
      <span class="body-1 flex-grow-0 flex-shrink-0 secondary--text">
        Collisions &#x2022;
      </span>
      <FcListFilterChips
        class="ml-1"
        @click-filter="actionRemoveFilterCollision"
        :filter-chips="filterChipsCollision"
        :max-width="320"
        :readonly="readonly" />
    </div>
    <div
      v-if="filterChipsStudy.length > 0"
      class="align-center d-flex mt-2">
      <span class="body-1 flex-grow-0 flex-shrink-0 secondary--text">
        Studies &#x2022;
      </span>
      <FcListFilterChips
        class="ml-1"
        @click-filter="actionRemoveFilterStudy"
        :filter-chips="filterChipsStudy"
        :max-width="320"
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
      // TODO: implement this
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
