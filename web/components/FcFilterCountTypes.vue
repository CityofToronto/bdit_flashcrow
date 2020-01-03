<template>
  <TdsChecklistDropdown
    class="fc-filter-count-types"
    name="countTypes"
    :options="options"
    v-model="internalValue">
    <span>Counts ({{internalValue.length}})</span>
  </TdsChecklistDropdown>
</template>

<script>
import TdsChecklistDropdown from '@/web/components/tds/TdsChecklistDropdown.vue';
import { COUNT_TYPES } from '@/lib/Constants';

export default {
  name: 'FilterCountTypes',
  components: {
    TdsChecklistDropdown,
  },
  props: {
    value: Array,
  },
  data() {
    return {
      countTypes: COUNT_TYPES,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    options() {
      return this.countTypes.map(({ label }, i) => ({ label, value: i }));
    },
  },
};
</script>

<style lang="postcss">
.fc-filter-count-types {
  & > .dropdown {
    width: 400px;
  }
}
</style>
