<template>
  <FcTooltip right>
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
        v-bind="attrsListItem"
        @click="actionClick">
        <v-list-item-icon>
          <v-icon>mdi-{{icon}}</v-icon>
          <slot></slot>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            <span v-if="external" class="sr-only">Opens in a new window</span>
            {{label}}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <span>{{label}}</span>
  </FcTooltip>
</template>

<script>
import { mapState } from 'vuex';

import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';

const ROUTES_BACK_REQUEST_VIEW = [
  'requestStudyBulkView',
  'requestStudyView',
];

export default {
  name: 'FcDashboardNavItem',
  components: {
    FcTooltip,
  },
  props: {
    activeRouteNames: {
      type: Array,
      default() { return []; },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    external: {
      type: Boolean,
      default: false,
    },
    icon: String,
    label: String,
    to: {
      type: Object,
      default: null,
    },
  },
  computed: {
    attrsListItem() {
      if (this.external) {
        return {
          target: '_blank',
          ...this.$attrs,
        };
      }
      return this.$attrs;
    },
    isActive() {
      const { backViewRequest, to } = this;
      if (to === null) {
        return false;
      }

      const { name } = this.$route;
      const { name: backViewRequestName } = backViewRequest;
      const { name: toName } = to;
      if (name === toName) {
        return true;
      }
      if (this.activeRouteNames.includes(name)) {
        return true;
      }
      return ROUTES_BACK_REQUEST_VIEW.includes(name) && backViewRequestName === toName;
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
