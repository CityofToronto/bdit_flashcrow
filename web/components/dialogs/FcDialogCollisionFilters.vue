<template>
  <v-dialog
    v-model="internalValue"
    max-width="336"
    scrollable>
    <v-card role="dialog">
      <v-card-title>
        <h1 class="headline">Filter</h1>
        <v-spacer></v-spacer>
        <FcButton
          type="secondary"
          @click="actionClearAll">
          Clear All
        </FcButton>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <h2 class="body-1 mt-4">TODO: Filters</h2>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
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
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogCollisionFilters',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
  },
  props: {
    // TODO: filters here
  },
  computed: {
    internalFilters() {
      return {
        // TODO: filters here
      };
    },
  },
  methods: {
    actionClearAll() {
      // TODO: set filters to default values
    },
    actionSave() {
      this.$emit('set-filters', this.internalFilters);
      this.internalValue = false;
    },
  },
};
</script>
