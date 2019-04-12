<template>
<b-col class="pane-display" :cols="cols">
</b-col>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'PaneDisplay',
  computed: {
    cols() {
      if (this.showMap) {
        return 8;
      }
      return 12;
    },
    ...mapState(['showMap']),
  },
};
</script>

<style lang="postcss">
.pane-display {
  background-color: #fff;
}
</style>
