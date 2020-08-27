<template>
  <div class="fc-selector-collapsed-location">
    <v-tooltip
      right
      :z-index="100">
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
    </v-tooltip>
  </div>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcSelectorCollapsedLocation',
  components: {
    FcButton,
  },
};
</script>

<style lang="scss">
.fc-selector-collapsed-location {
  & > button.fc-button.v-btn.fc-search-bar-open {
    min-width: 36px;
    width: 36px;
  }
}
</style>
