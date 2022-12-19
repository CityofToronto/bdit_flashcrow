<template>
  <FcTooltip
    content-class="fc-tooltip-status-progress-bar"
    :max-width="400"
    bottom>
    <template v-slot:activator="{ on }">
      <FcButton
        class="information-button"
        type="icon"
        v-on="on">
        <v-icon class="information-icon">mdi-information-outline</v-icon>
      </FcButton>
    </template>
    <slot></slot>
  </FcTooltip>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'TooltipStatusProgressBar',
  components: {
    FcButton,
    FcTooltip,
  },
};
</script>

<style lang="scss">
.v-tooltip__content.fc-tooltip-status-progress-bar {
  font-size: 0.875rem !important;
}
.information-button {
  width: 18px !important;
  height: 18px !important;
  padding-bottom: 3px !important;
}
.information-icon {
  font-size: 18px !important;
}
</style>
