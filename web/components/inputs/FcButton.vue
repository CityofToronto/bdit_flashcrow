<template>
  <v-btn
    class="fc-button"
    v-bind="{
      ...typeAttrs,
      ...$attrs,
    }"
    v-on="$listeners">
    <slot></slot>
  </v-btn>
</template>

<script>
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
  'fab-text': {
    class: 'elevation-2',
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
};
</script>

<style lang="scss">
button.fc-button.v-btn.secondary--text {
  background-color: white;
  & > .v-btn__content {
    color: var(--v-default-base);
  }
}
</style>
