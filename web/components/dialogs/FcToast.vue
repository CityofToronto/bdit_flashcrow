<template>
  <v-snackbar
    v-model="internalValue"
    bottom
    class="fc-toast pb-5 pl-7"
    :color="color + ' darker-1'"
    :timeout="timeout">
    <slot name="icon"></slot>
    <span class="body-1">{{text}}</span>
    <template v-slot:action="{ attrs }">
      <FcButton
        v-if="action !== null"
        color="white"
        :disabled="loading"
        :loading="loading"
        type="tertiary"
        v-bind="attrs"
        @click="actionCallback">
        {{action}}
      </FcButton>
    </template>
  </v-snackbar>
</template>

<script>
import { mapMutations } from 'vuex';

import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

const TIMEOUT_NEVER = -1;
const TIMEOUT_AUTO_CLOSE = 10000;

export default {
  name: 'FcToast',
  mixins: [FcMixinVModelProxy(Boolean)],
  components: {
    FcButton,
  },
  props: {
    action: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: 'black',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    text: String,
  },
  computed: {
    timeout() {
      return this.action === null ? TIMEOUT_AUTO_CLOSE : TIMEOUT_NEVER;
    },
  },
  methods: {
    actionCallback() {
      this.$emit('toast-action');
      this.clearToast();
    },
    ...mapMutations(['clearToast']),
  },
};
</script>
