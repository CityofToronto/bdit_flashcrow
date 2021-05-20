<template>
  <div class="fc-layout-request-editor fill-height">
    <div class="fc-pane-wrapper d-flex fill-height">
      <div class="fc-drawer flex-grow-1 flex-shrink-0">
        <router-view></router-view>
      </div>
      <div class="flex-grow-1 flex-shrink-0">
        <FcPaneMap
          :show-location-selection="false" />
      </div>
    </div>
  </div>
</template>

<script>
import FcPaneMap from '@/web/components/FcPaneMap.vue';

export default {
  name: 'FcLayoutRequestEditor',
  components: {
    FcPaneMap,
  },
};
</script>

<style lang="scss">
.fc-layout-request-editor {
  width: 100%;

  & > .fc-pane-wrapper > div {
    flex-basis: 0;
    width: 50%;
  }

  & > .fc-pane-wrapper > .fc-drawer {
    border-right: 1px solid rgba(0, 0, 0, 0.12);
  }
}

</style>
