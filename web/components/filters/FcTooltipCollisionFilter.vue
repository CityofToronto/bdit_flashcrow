<template>
  <FcTooltip
    content-class="fc-tooltip-collision-filter"
    :max-width="400"
    top>
    <template v-slot:activator="{ on }">
      <FcButton
        type="icon"
        v-on="on">
        <v-icon>mdi-help-circle-outline</v-icon>
      </FcButton>
    </template>
    <slot></slot>
  </FcTooltip>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcTooltipCollisionFilter',
  components: {
    FcButton,
    FcTooltip,
  },
};
</script>

<style lang="scss">
.v-tooltip__content.fc-tooltip-collision-filter {
  font-size: 0.875rem !important;
}
</style>
