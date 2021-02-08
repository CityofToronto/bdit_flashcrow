<template>
  <ul class="pl-0">
    <v-chip
      v-for="(filterChip, i) in filterChips"
      :key="i"
      class="mr-2"
      :class="{ 'primary--text': !readonly }"
      tag="li"
      v-bind="attrsChip"
      @click="actionClickChip(filterChip)">
      {{filterChip.label}}
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
          inputValue: true,
        };
      }
      return { color: 'light-blue lighten-5' };
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
