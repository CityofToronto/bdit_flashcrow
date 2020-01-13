<template>
  <v-list-item
    :disabled="disabled"
    link
    :to="to">
    <v-list-item-icon>
      <v-icon>mdi-{{icon}}</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>{{label}}</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  name: 'FcDashboardNavItem',
  props: {
    disabled: Boolean,
    icon: String,
    label: String,
    to: Object,
  },
  computed: {
    title() {
      if (!this.disabled) {
        return null;
      }
      const { label } = this;
      return `${label} (Log in to access)`;
    },
  },
};
</script>
