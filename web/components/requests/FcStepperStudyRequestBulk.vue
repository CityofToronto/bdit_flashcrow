<template>
  <v-stepper
    v-model="internalValue"
    class="fc-stepper-study-request-bulk elevation-0"
    alt-labels>
    <v-stepper-header class="elevation-0 px-3 pt-1">
      <v-stepper-step
        :aria-disabled="!hasIntersections"
        class="pa-2"
        :class="{ disabled: !hasIntersections }"
        :complete="hasIntersections && internalValue > 1"
        :editable="hasIntersections > 0 && internalValue > 1"
        :step="1">
        Select intersections
      </v-stepper-step>

      <v-icon small>mdi-chevron-right</v-icon>

      <v-stepper-step
        :aria-disabled="!hasMidblocks"
        class="pa-2"
        :class="{ disabled: !hasMidblocks }"
        :complete="hasMidblocks && internalValue > 2"
        :editable="hasMidblocks && internalValue > 2"
        :step="2">
        Select midblocks
      </v-stepper-step>

      <v-icon small>mdi-chevron-right</v-icon>

      <v-stepper-step
        class="pa-2"
        :complete="internalValue > 3"
        :editable="internalValue > 3"
        :step="3">
        Request details
      </v-stepper-step>

      <v-icon small>mdi-chevron-right</v-icon>

      <v-stepper-step
        class="pa-2"
        :step="4">
        Review &amp; Submit
      </v-stepper-step>
    </v-stepper-header>
  </v-stepper>
</template>

<script>
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStepperStudyRequestBulk',
  mixins: [FcMixinVModelProxy(Number)],
  props: {
    indicesIntersections: Array,
    indicesMidblocks: Array,
  },
  computed: {
    hasIntersections() {
      return this.indicesIntersections.length > 0;
    },
    hasMidblocks() {
      return this.indicesMidblocks.length > 0;
    },
  },
};
</script>

<style lang="scss">
.fc-stepper-study-request-bulk {
  &.v-stepper--alt-labels .v-stepper__step {
    flex-basis: auto;
    & > .v-stepper__label {
      color: var(--v-default-base);
    }
    &.disabled {
      opacity: 0.38;
      pointer-events: none;
    }
    &.v-stepper__step--inactive {
      & > .v-stepper__step__step {
        background: var(--v-secondary-base) !important;
      }
      & > .v-stepper__label {
        color: var(--v-secondary-base);
      }
    }
  }
}
</style>
