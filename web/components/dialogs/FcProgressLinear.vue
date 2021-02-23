<template>
  <v-progress-linear
    :aria-label="ariaLabel"
    color="primary"
    indeterminate />
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'FcProgressLinear',
  props: {
    ariaLabel: String,
    silent: {
      type: Boolean,
      default: false,
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
