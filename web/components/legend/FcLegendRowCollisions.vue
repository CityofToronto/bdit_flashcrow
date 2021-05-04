<template>
  <div>
    <div class="align-center d-flex">
      <div class="body-1 flex-grow-1 mt-1">
        <div class="align-center d-flex">
          <div class="fc-legend-icon flex-grow-0 flex-shrink-0">
            <div class="fc-legend-icon-collision"></div>
          </div>
          <div class="ml-4 mr-2">
            Collisions
            <v-messages
              :value="['Map displays only last 10 years of data']" />
          </div>
        </div>

        <div class="align-center d-flex mt-2">
          <div class="fc-legend-icon flex-grow-0 flex-shrink-0">
            <div class="fc-legend-icon-collision-ksi"></div>
          </div>
          <div class="ml-4 mr-2">
            KSI Collisions
            <v-messages
              :value="['At least one killed or seriously injured person']" />
          </div>
        </div>
      </div>
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
  name: 'FcLegendRowCollisions',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcTooltip,
  },
  computed: {
    ariaLabel() {
      return this.internalValue ? 'Hide Collisions' : 'Show Collisions';
    },
  },
};
</script>

<style lang="scss">
.fc-legend-icon-collision {
  background: #ef4848;
  border: 1px solid #733;
  border-radius: 6.5px;
  height: 13px;
  left: 5.5px;
  position: absolute;
  top: 5.5px;
  width: 13px;
}

.fc-legend-icon-collision-ksi {
  background: #ef4848;
  border: 3px solid #733;
  border-radius: 6.5px;
  height: 13px;
  left: 5.5px;
  position: absolute;
  top: 5.5px;
  width: 13px;
}
</style>
