<template>
  <v-dialog
    v-model="internalValue"
    class="shading"
    max-width="560">
    <v-card role="dialog">
      <v-card-title>
        <h2 class="display-1">{{title}}</h2>
      </v-card-title>
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions class="shading">
        <v-spacer></v-spacer>
        <FcButton
          type="tertiary"
          @click="internalValue = false">
          {{textCancel}}
        </FcButton>
        <FcButton
          type="tertiary"
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
  },
  methods: {
    actionClickOk() {
      this.$emit('action-ok');
      this.internalValue = false;
    },
  },
};
</script>
