<template>
  <v-row
    class="align-center px-3 py-2"
    no-gutters>
    <v-col cols="2">
      <FcButton
        v-if="isCreate"
        type="secondary"
        @click="$emit('action-navigate-back')">
        <v-icon left>mdi-chevron-left</v-icon>
        {{labelNavigateBack}}
      </FcButton>
    </v-col>
    <v-col class="text-center" cols="8">
      <h1 class="headline">
        <span>
          {{title}}:
        </span>
        <span class="font-weight-regular">
          {{subtitle}}
        </span>
      </h1>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { getLocationsDescription } from '@/lib/geo/CentrelineUtils';
import FcButton from '@/web/components/inputs/FcButton.vue';

export default {
  name: 'FcHeaderRequestStudy',
  components: {
    FcButton,
  },
  props: {
    isCreate: Boolean,
    isSingleLocation: Boolean,
  },
  computed: {
    labelNavigateBack() {
      if (this.isCreate && this.locationActive === null) {
        return 'View Map';
      }
      return 'View Data';
    },
    subtitle() {
      if (this.isSingleLocation) {
        if (this.locationActive === null) {
          return 'needs location';
        }
        return this.locationActive.description;
      }
      return getLocationsDescription(this.locations);
    },
    title() {
      if (this.isCreate) {
        if (this.isSingleLocation) {
          return 'Request Study';
        }
        return 'Bulk Request Study';
      }
      const { id } = this.$route.params;
      if (this.isSingleLocation) {
        return `Edit Request #${id}`;
      }
      return `Edit Bulk Request #${id}`;
    },
    ...mapState(['locationMode', 'locations']),
    ...mapState('viewData', ['detailView']),
    ...mapGetters(['locationActive']),
  },
};
</script>
