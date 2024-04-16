<template>
  <v-snackbar
    v-model="internalValue"
    bottom
    class="fc-toast pb-5 pl-7"
    :color="color + ' darker-4'"
    :min-width=0
    :timeout="timeout">
    <slot name="icon"></slot>
    <span class="body-1">{{text}}</span>
    <span class="body-1" v-html="html"></span>
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
      <FcButton
        class="ml-2"
        color="white"
        :disabled="loading"
        :loading="loading"
        type="tertiary"
        v-bind="attrs"
        @click="clearToast">
        Close
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
    html: String,
    loading: {
      type: Boolean,
      default: false,
    },
    text: String,
    disableAutoClose: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    hasAction() {
      return this.action !== null;
    },
    timeout() {
      let delayBeforeClose = TIMEOUT_AUTO_CLOSE;
      if (this.disableAutoClose || this.hasAction) {
        delayBeforeClose = TIMEOUT_NEVER;
      }
      return delayBeforeClose;
    },
  },
  watch: {
    text: {
      handler() {
        this.setAriaNotification(this.text);
      },
      immediate: true,
    },
  },
  methods: {
    actionCallback() {
      this.$emit('toast-action');
      this.clearToast();
    },
    ...mapMutations(['clearToast', 'setAriaNotification']),
  },
  mounted() {
    if (this.timeout === TIMEOUT_AUTO_CLOSE) {
      setTimeout(this.clearToast, TIMEOUT_AUTO_CLOSE);
    }
  },
};
</script>
