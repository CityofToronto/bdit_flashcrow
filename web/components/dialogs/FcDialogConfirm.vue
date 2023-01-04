<template>
  <v-dialog
    v-model="internalValue"
    class="shading"
    max-width="560">
    <v-card
      aria-labelledby="heading_dialog_confirm"
      :class="parentClass"
      role="dialog">
      <v-card-title>
        <h2 class="display-1" id="heading_dialog_confirm">{{title}}</h2>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <slot></slot>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          {{textCancel}}
        </FcButton>
        <FcButton
          :type="okButtonType"
          @click="actionClickOk">
          {{textOk}}
        </FcButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcDialogConfirm',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
  },
  props: {
    textCancel: {
      type: String,
      default: 'Cancel',
    },
    textOk: {
      type: String,
      default: 'OK',
    },
    title: {
      type: String,
      default: 'Confirm',
    },
    okButtonType: {
      type: String,
      default: 'tertiary',
    },
    parentClass: {
      type: String,
      default: 'confirmation-dialog',
    },
  },
  methods: {
    actionClickOk() {
      this.$emit('action-ok');
      this.internalValue = false;
    },
  },
};
</script>
