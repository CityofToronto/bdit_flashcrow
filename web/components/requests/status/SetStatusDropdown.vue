<template>
  <v-menu
    v-model="showMenu"
    :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        type="secondary"
        v-bind="attrs"
        :disabled="disabled"
        v-on="on">
        <v-icon :color="currentStatus.color" left>
          mdi-circle-medium
        </v-icon>
        <span>Set Status</span>
        <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list>
      <v-list-item v-for="status in statusTransitions" :key="status.name"
        class="fc-item-study-requests-status"
        @click="transitionStatus(status)">
      <v-list-item-title>
        <v-icon :color="status.color" left>mdi-circle-medium</v-icon>
        <span>{{ status.text }}</span>
      </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'SetStatusDropdown',
  components: {
    FcButton,
  },
  props: {
    currentStatus: {
      type: Object,
      required: true,
    },
    statusTransitions: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showMenu: false,
    };
  },
  methods: {
    transitionStatus(nextStatus) {
      this.showMenu = false;
      this.$emit('transition-status', nextStatus);
    },
  },
};
</script>
