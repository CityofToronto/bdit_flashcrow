<template>
  <div>
    <div class="align-center d-flex">
      <div class="fc-legend-icon flex-grow-0 flex-shrink-0">
        <img src="/icons/map/study.svg" width="24" height="24" />
      </div>
      <div class="body-1 flex-grow-1 ml-4 mt-1">Studies</div>
      <FcTooltip left>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-checkbox
              v-model="internalValue"
              :aria-label="ariaLabel"
              class="mt-0"
              color="secondary"
              hide-details
              off-icon="mdi-eye-off"
              on-icon="mdi-eye"
              v-on="on"></v-checkbox>
          </div>
        </template>
        <span>{{ariaLabel}}</span>
      </FcTooltip>
    </div>
  </div>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcLegendRowStudies',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcTooltip,
  },
  computed: {
    ariaLabel() {
      return this.internalValue ? 'Hide Studies' : 'Show Studies';
    },
  },
};
</script>
