<template>
  <li
    class="fc-dashboard-nav-item text-center"
    :class="{ disabled }"
    :title="title">
    <div v-if="disabled">
      <v-icon dark>mdi-{{icon}}</v-icon>
      <span>{{label}}</span>
    </div>
    <router-link v-else :to="to">
      <v-icon dark>mdi-{{icon}}</v-icon>
      <span>{{label}}</span>
    </router-link>
  </li>
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

<style lang="postcss">
.fc-dashboard-nav-item {
  & > a,
  & > div {
    font-size: var(--font-size-s);
    padding: var(--space-l) var(--space-m);
  }
  & > a {
    color: var(--base-lighter);
    display: inline-block;
    text-decoration: none;
    width: 100%;
    &:hover {
      background-color: var(--base-dark);
    }
    &.router-link-active {
      background-color: var(--primary);
      color: var(--base-lightest);
      &:hover {
        background-color: var(--primary-vivid);
      }
    }
  }
  & i.v-icon.v-icon {
    display: block;
    font-size: var(--font-size-2xl);
    margin-bottom: var(--space-m);
  }
  &.disabled {
    color: var(--disabled);
    opacity: var(--opacity-50);
  }
}
</style>
