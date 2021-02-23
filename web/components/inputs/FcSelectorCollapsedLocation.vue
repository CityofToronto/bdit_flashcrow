<template>
  <div class="fc-selector-collapsed-location">
    <FcTooltip right>
      <template v-slot:activator="{ on }">
        <FcButton
          aria-label="Search for new location"
          class="fc-search-bar-open"
          type="fab-text"
          @click="$router.push({ name: 'viewData' })"
          v-on="on">
          <v-icon class="unselected--text">mdi-magnify</v-icon>
        </FcButton>
      </template>
      <span>Search for new location</span>
    </FcTooltip>
  </div>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcSelectorCollapsedLocation',
  components: {
    FcButton,
    FcTooltip,
  },
};
</script>

<style lang="scss">
.fc-selector-collapsed-location {
  & > button.fc-button.v-btn.fc-search-bar-open {
    height: 38px;
    min-width: 36px;
    width: 36px;
  }
}
</style>
