<template>
  <v-btn
    class="fc-button"
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
import analyticsClient from '@/web/analytics/analyticsClient';

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
    type: String,
  },
  computed: {
    typeAttrs() {
      return BUTTON_ATTRS[this.type];
    },
  },
  methods: {
    actionClick() {
      let ihtml = '';
      if (Object.prototype.hasOwnProperty.call(this.$attrs, 'aria-label')) {
        ihtml = this.$attrs['aria-label'];
      } else {
        ihtml = this.$el.innerText.trim();
      }

      const event = analyticsClient.buttonEvent(ihtml, this.$el);
      analyticsClient.send([event]);
    },
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
