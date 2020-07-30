<template>
  <v-tooltip right>
    <template v-slot:activator="{ on }">
      <v-list-item
        v-on="on"
        class="fc-nav-item"
        :class="{
          'fc-nav-item-active': isActive,
        }"
        color="primary"
        :disabled="disabled"
        link
        :to="to"
        @click="actionClick">
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
import { mapState } from 'vuex';

export default {
  name: 'FcDashboardNavItem',
  props: {
    activeRouteNames: {
      type: Array,
      default() { return []; },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    icon: String,
    label: String,
    to: Object,
  },
  computed: {
    isActive() {
      const { name } = this.$route;
      const { backViewRequest, to } = this;
      const { name: backViewRequestName } = backViewRequest;
      const { name: toName } = to;
      if (name === toName) {
        return true;
      }
      if (this.activeRouteNames.includes(name)) {
        return true;
      }
      return name === 'requestStudyView' && backViewRequestName === toName;
    },
    ...mapState(['backViewRequest']),
  },
  methods: {
    actionClick() {
      const event = this.$analytics.buttonEvent(this.label, this.$el);
      this.$analytics.send([event]);
    },
  },
};
</script>

<style lang="scss">
.fc-nav-item.v-list-item {
  flex: 0;
  &.fc-nav-item-active {
    border-right: 3px solid var(--v-primary-base);
    &.v-list-item--link::before {
      background-color: transparent;
    }
    & .v-icon.v-icon {
      color: var(--v-primary-base);
    }
  }
}

</style>
