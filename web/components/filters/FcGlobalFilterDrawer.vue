<template>
  <v-navigation-drawer
    v-model="internalValue"
    absolute
    class="fc-global-filter-drawer"
    right
    temporary
    :width="280">
    <div class="d-flex fill-height flex-column">
      <div class="align-center d-flex flex-grow-0 flex-shrink-0 px-4 py-3 shading">
        <h2 class="display-1">Filter</h2>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </div>

      <v-divider></v-divider>

      <div class="flex-grow-1 flex-shrink-1">
        TODO: filters body
      </div>

      <v-divider></v-divider>

      <div class="d-flex flex-grow-0 flex-shrink-0 px-4 py-2 shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          Cancel
        </FcButton>
        <FcButton
          type="tertiary"
          @click="actionSave">
          Save
        </FcButton>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcGlobalFilterDrawer',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
  },
  methods: {
    actionClearAll() {

    },
    actionSave() {
      // TODO: implement this
      this.internalValue = false;
    },
  },
};
</script>

<style lang="scss">
.fc-global-filter-drawer.v-navigation-drawer--temporary {
  z-index: 400;
}
</style>
