<template>
  <ul class="fc-list-filter-chips pl-0 mb-n2">
    <v-chip
      v-for="(filterChip, i) in filterChips"
      :key="i"
      class="mr-2 mb-2"
      :class="{ 'primary--text': !readonly }"
      :style="styleChip"
      tag="li"
      v-bind="attrsChip"
      @click="actionClickChip(filterChip)">
      <span :class="{ 'text-truncate' : maxWidth !== null }">
        {{filterChip.label}}
      </span>
      <v-icon
        v-if="!readonly"
        right>
        mdi-close-circle
      </v-icon>
    </v-chip>
  </ul>
</template>

<script>
export default {
  name: 'FcListFilterChips',
  props: {
    filterChips: Array,
    maxWidth: {
      type: Number,
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    attrsChip() {
      if (this.readonly) {
        return {
          filter: true,
        };
      }
      return { color: 'light-blue lighten-5' };
    },
    styleChip() {
      const styleChip = {};
      if (this.maxWidth !== null) {
        styleChip.maxWidth = `${this.maxWidth}px`;
      }
      return styleChip;
    },
  },
  methods: {
    actionClickChip(filterChip) {
      if (!this.readonly) {
        this.$emit('click-filter', filterChip);
      }
    },
  },
};
</script>
