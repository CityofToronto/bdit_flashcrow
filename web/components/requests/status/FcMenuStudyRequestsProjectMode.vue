<template>
  <FcMenu
    :items="[ProjectMode.CREATE_NEW, ProjectMode.ADD_TO_EXISTING]"
    v-bind="$attrs"
    @action-menu="actionMenu">
    <v-icon color="primary" left>mdi-folder-plus</v-icon>
    <span>{{label}}</span>
    <template v-slot:item="{ item }">
      <span>{{item.title}}</span>
      <v-messages :value="[item.subtitle.replace('{}', textInject)]" />
    </template>
  </FcMenu>
</template>

<script>
import { ProjectMode } from '@/lib/Constants';
import FcMenu from '@/web/components/inputs/FcMenu.vue';

export default {
  name: 'FcMenuStudyRequestsProjectMode',
  components: {
    FcMenu,
  },
  props: {
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
