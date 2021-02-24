<template>
  <v-menu :min-width="minWidth">
    <template v-slot:activator="{ attrs: attrsMenu, on: onMenu }">
      <FcButton
        :class="buttonClass"
        :disabled="disabled"
        type="secondary"
        v-bind="{
          ...attrsMenu,
          ...$attrs,
        }"
        v-on="onMenu">
        <slot></slot>
        <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        @click="$emit('action-menu', item)">
        <v-list-item-title>
          <slot v-if="hasItemSlot" name="item" v-bind="{ item, i }"></slot>
          <span v-else>{{item.text}}</span>
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcMenu',
  components: {
    FcButton,
  },
  props: {
    buttonClass: {
      type: [Array, Object, String],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    items: Array,
    minWidth: {
      type: [Number, String],
      default: undefined,
    },
  },
  computed: {
    hasItemSlot() {
      return !!this.$scopedSlots.item;
    },
  },
};
</script>
