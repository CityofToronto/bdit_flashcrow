<template>
  <v-tooltip right>
    <template v-slot:activator="{ on }">
      <v-list-item
        v-on="on"
        active-class="fc-nav-item-active"
        class="fc-nav-item"
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
    <span>{{label}}</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'FcDashboardNavItem',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    icon: String,
    label: String,
    to: Object,
  },
};
</script>

<style lang="postcss">
.fc-nav-item.v-list-item {
  flex: 0;
  &.fc-nav-item-active {
    border-right: 3px solid var(--v-primary-base);
  }
}

</style>
