<template>
  <v-btn
    class="fc-button"
    :small="small"
    :width="width"
    v-bind="{
      ...typeAttrs,
      ...$attrs,
    }"
    @click="actionClick"
    v-on="$listeners">
    <slot></slot>
  </v-btn>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import { hasAuthScope } from '@/lib/auth/ScopeMatcher';
import { saveLoginState } from '@/web/store/LoginState';

const BUTTON_ATTRS = {
  primary: {
    color: 'primary',
  },
  secondary: {
    color: 'secondary',
    outlined: true,
  },
  tertiary: {
    color: 'primary',
    text: true,
  },
  'fab-icon': {
    fab: true,
    icon: true,
    small: true,
  },
  'fab-text': {
    class: 'elevation-2',
    color: 'white',
  },
  icon: {
    icon: true,
  },
};

export default {
  name: 'FcButton',
  props: {
    scope: {
      type: Array,
      default: null,
    },
    small: {
      type: Boolean,
      default: false,
    },
    type: String,
    width: {
      type: [Number, String],
      default: undefined,
    },
  },
  computed: {
    typeAttrs() {
      return BUTTON_ATTRS[this.type];
    },
    ...mapState(['auth']),
  },
  methods: {
    actionClick() {
      let ihtml = '';
      if (Object.prototype.hasOwnProperty.call(this.$attrs, 'aria-label')) {
        ihtml = this.$attrs['aria-label'];
      } else {
        ihtml = this.$el.innerText.trim();
      }

      const event = this.$analytics.buttonEvent(ihtml, this.$el);
      this.$analytics.send([event]);
      return this.actionClickAuth();
    },
    actionClickAuth() {
      const { auth: { loggedIn, user }, scope } = this;
      if (scope === null) {
        return true;
      }
      if (loggedIn) {
        if (hasAuthScope(user, scope)) {
          return true;
        }
        this.setDialog({
          dialog: 'ConfirmUnauthorized',
          dialogData: { scope },
        });
        return false;
      }
      const event = this.$analytics.signInEvent();
      this.$analytics.send([event]);

      saveLoginState(this.$route);
      document.forms.formSignIn.submit();
      return false;
    },
    ...mapMutations(['setDialog']),
  },
};
</script>

<style lang="scss">
button.fc-button.v-btn.secondary--text {
  background-color: white;
  border-color: var(--v-border-base);
  & > .v-btn__content {
    color: var(--v-default-base);
  }
}
</style>
