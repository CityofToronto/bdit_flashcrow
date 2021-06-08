<template>
  <v-menu :disabled="disabled">
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        v-bind="attrs"
        v-on="on"
        :class="buttonClass"
        :disabled="disabled"
        :loading="loading"
        type="secondary">
        <v-icon color="primary" left>mdi-folder-plus</v-icon>
        <span>{{label}}</span>
        <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list two-line>
      <v-list-item
        v-for="item in [ProjectMode.CREATE_NEW, ProjectMode.ADD_TO_EXISTING]"
        :key="item.name"
        @click="$emit('action-project-mode', item)">
        <v-list-item-content>
          <v-list-item-title>{{item.title}}</v-list-item-title>
          <v-list-item-subtitle>
            {{item.subtitle.replace('{}', textInject)}}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { ProjectMode } from '@/lib/Constants';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcMenuStudyRequestsProjectMode',
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
    label: String,
    textInject: String,
  },
  data() {
    return {
      ProjectMode,
    };
  },
  methods: {
    actionMenu(projectMode) {
      this.$emit('action-project-mode', projectMode);
    },
  },
};
</script>
