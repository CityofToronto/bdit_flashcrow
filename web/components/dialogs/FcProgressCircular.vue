<template>
  <v-progress-circular
    :aria-label="ariaLabel"
    color="primary"
    indeterminate
    :size="size"
    :width="width" />
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'FcProgressCircular',
  props: {
    ariaLabel: String,
    silent: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    size() {
      return this.small ? 20 : 80;
    },
    width() {
      return this.small ? 2 : 4;
    },
  },
  mounted() {
    if (!this.silent) {
      this.setAriaNotification(this.ariaLabel);
    }
  },
  methods: {
    ...mapMutations(['setAriaNotification']),
  },
};
</script>
