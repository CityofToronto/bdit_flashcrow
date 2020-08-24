<template>
  <v-snackbar
    v-model="hasToast"
    bottom
    class="fc-toast pb-5 pl-7"
    :color="color + ' darken-2'"
    :timeout="timeout">
    <span class="body-1">{{text}}</span>
    <template v-slot:action="{ attrs }">
      <FcButton
        v-if="action !== null"
        color="white"
        type="tertiary"
        v-bind="attrs"
        @click="actionCallback">
        {{action.text}}
      </FcButton>
    </template>
  </v-snackbar>
</template>

<script>
import { mapMutations } from 'vuex';

import FcButton from '@/web/components/inputs/FcButton.vue';

const TIMEOUT_NEVER = -1;
const TIMEOUT_NON_CLOSEABLE = 10000;

export default {
  name: 'FcToast',
  components: {
    FcButton,
  },
  props: {
    action: {
      type: Object,
      default: null,
    },
    color: {
      type: String,
      default: 'black',
    },
    text: String,
  },
  computed: {
    hasToast: {
      get() {
        return this.toast !== null;
      },
      set(hasToast) {
        if (!hasToast) {
          this.clearToast();
        }
      },
    },
    timeout() {
      return this.action === null ? TIMEOUT_NON_CLOSEABLE : TIMEOUT_NEVER;
    },
  },
  methods: {
    actionCallback() {
      this.action.callback();
      this.clearToast();
    },
    ...mapMutations(['clearToast']),
  },
};
</script>
