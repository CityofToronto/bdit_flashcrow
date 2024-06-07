<template>
  <v-dialog v-model="internalValue" max-width="560" z-index="301">
    <v-card aria-labelledby="heading_dialog_alert" role="dialog">
      <v-card-title class="shading">
        <h2 class="display-1" id="heading_dialog_alert">{{ title }}</h2>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <slot></slot>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="shading">
        <v-spacer></v-spacer>
        <FcButton type="primary" @click="internalValue = false">
          {{ textOk }}
        </FcButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogAlertIncompatibleStudy',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
  },
  props: {
    textOk: {
      type: String,
      default: 'OK',
    },
    title: {
      type: String,
      default: 'Alert',
    },
  },
};
</script>
