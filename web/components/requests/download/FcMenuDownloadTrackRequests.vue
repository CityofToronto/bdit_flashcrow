<template>
  <v-menu>
    <template v-slot:activator="{ on, attrs }">
      <FcButton
        v-bind="attrs"
        v-on="on"
        class="ml-2"
        :loading="loading"
        type="secondary">
        <v-icon color="primary" left>mdi-cloud-download</v-icon>
        Download
        <span class="sr-only">Requests</span>
        <v-icon right>mdi-menu-down</v-icon>
      </FcButton>
    </template>
    <v-list two-line>
      <v-list-item
        :disabled="selectedItems.length === 0"
        @click="$emit('action-download', true)">
        <v-list-item-content>
          <v-list-item-title>Selected ({{selectedItems.length}})</v-list-item-title>
          <v-list-item-subtitle v-if="selectedItems.length > 0">
            Download only the selected study requests.
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-list-item @click="$emit('action-download', false)">
        <v-list-item-content>
          <v-list-item-title>All</v-list-item-title>
          <v-list-item-subtitle>
            Download all study requests that match the active filters.
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcMenuDownloadTrackRequests',
  components: {
    FcButton,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    selectedItems: Array,
  },
};
</script>
