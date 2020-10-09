<template>
  <v-breadcrumbs
    class="pa-0"
    :divider="divider"
    :items="items">
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item
        :aria-disabled="item.disabled.toString()"
        :disabled="item.disabled"
        :to="item.to">
        {{item.text}}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { getLocationsDescription } from '@/lib/geo/CentrelineUtils';

export default {
  name: 'FcBreadcrumbsStudyRequest',
  props: {
    studyRequest: Object,
    studyRequestBulkName: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      divider: '\u203a',
    };
  },
  computed: {
    itemCurrent() {
      if (this.studyRequest === null) {
        return null;
      }
      const { name } = this.$route;
      if (name === 'requestStudyBulkView') {
        return {
          disabled: true,
          text: this.studyRequest.name,
          to: {
            name: 'requestStudyBulkView',
            params: { id: this.studyRequest.id },
          },
        };
      }
      if (name === 'requestStudyView') {
        const text = getLocationsDescription(this.locationsSelection.locations);
        return {
          disabled: true,
          text,
          to: {
            name: 'requestStudyView',
            params: { id: this.studyRequest.id },
          },
        };
      }
      return null;
    },
    itemNavigateBack() {
      if (this.studyRequest === null) {
        return null;
      }
      const { name } = this.$route;
      if (name === 'requestStudyBulkView') {
        return null;
      }
      if (name === 'requestStudyView') {
        if (this.studyRequest.studyRequestBulkId === null) {
          return null;
        }
        return {
          disabled: false,
          text: this.studyRequestBulkName,
          to: {
            name: 'requestStudyBulkView',
            params: { id: this.studyRequest.studyRequestBulkId },
          },
        };
      }
      return null;
    },
    items() {
      const items = [{
        disabled: false,
        text: this.labelBackViewRequest,
        to: this.routeBackViewRequest,
      }];
      if (this.itemNavigateBack !== null) {
        items.push(this.itemNavigateBack);
      }
      if (this.itemCurrent !== null) {
        items.push(this.itemCurrent);
      }
      return items;
    },
    ...mapState(['backViewRequest', 'locationsSelection']),
    ...mapGetters(['labelBackViewRequest', 'routeBackViewRequest']),
  },
};
</script>
