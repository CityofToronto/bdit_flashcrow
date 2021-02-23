<template>
  <nav
    aria-label="Breadcrumbs: Study Request"
    class="fc-breadcrumbs-study-request">
    <FcProgressCircular
      v-if="this.itemCurrent === null"
      aria-label="Loading breadcrumbs"
      small />
    <v-breadcrumbs
      v-else
      class="pa-0"
      :divider="divider"
      :items="items">
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          :aria-disabled="item.disabled.toString()"
          :disabled="item.disabled"
          exact
          :to="item.to">
          {{item.text}}
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>
  </nav>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import FcProgressCircular from '@/web/components/dialogs/FcProgressCircular.vue';

export default {
  name: 'FcBreadcrumbsStudyRequest',
  components: {
    FcProgressCircular,
  },
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
    itemBackViewRequest() {
      return {
        disabled: false,
        text: this.labelBackViewRequest,
        to: this.routeBackViewRequest,
      };
    },
    itemCurrent() {
      if (this.textCurrent === null) {
        return null;
      }
      const { name, params } = this.$route;
      return {
        disabled: true,
        text: this.textCurrent,
        to: { name, params },
      };
    },
    items() {
      if (this.itemCurrent === null) {
        return [];
      }
      return [
        this.itemBackViewRequest,
        ...this.itemsNavigateBack,
        this.itemCurrent,
      ];
    },
    itemsNavigateBack() {
      if (this.studyRequest === null) {
        return [];
      }
      const { name } = this.$route;
      if (name === 'requestStudyBulkView') {
        return [];
      }
      if (name === 'requestStudyView') {
        const itemsNavigateBack = [];
        if (this.studyRequest.studyRequestBulkId !== null) {
          itemsNavigateBack.push({
            disabled: false,
            text: this.studyRequestBulkName,
            to: {
              name: 'requestStudyBulkView',
              params: { id: this.studyRequest.studyRequestBulkId },
            },
          });
        }
        return itemsNavigateBack;
      }
      if (name === 'requestStudyBulkEdit') {
        return [{
          disabled: false,
          text: this.studyRequest.name,
          to: {
            name: 'requestStudyBulkView',
            params: { id: this.studyRequest.id },
          },
        }];
      }
      if (name === 'requestStudyEdit') {
        const itemsNavigateBack = [];
        if (this.studyRequest.studyRequestBulkId !== null) {
          itemsNavigateBack.push({
            disabled: false,
            text: this.studyRequestBulkName,
            to: {
              name: 'requestStudyBulkView',
              params: { id: this.studyRequest.studyRequestBulkId },
            },
          });
        }
        const text = getLocationsSelectionDescription(this.locationsSelection);
        itemsNavigateBack.push({
          disabled: false,
          text,
          to: {
            name: 'requestStudyView',
            params: { id: this.studyRequest.id },
          },
        });
        return itemsNavigateBack;
      }
      return [];
    },
    textCurrent() {
      if (this.studyRequest === null) {
        return null;
      }
      const { name } = this.$route;
      if (name === 'requestStudyBulkView') {
        return this.studyRequest.name;
      }
      if (name === 'requestStudyView') {
        return getLocationsSelectionDescription(this.locationsSelection);
      }
      if (name === 'requestStudyBulkEdit' || name === 'requestStudyEdit') {
        return 'Edit';
      }
      return null;
    },
    ...mapState(['backViewRequest', 'locationsSelection']),
    ...mapGetters(['labelBackViewRequest', 'routeBackViewRequest']),
  },
};
</script>
