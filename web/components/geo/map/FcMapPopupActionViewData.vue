<template>
  <FcButton
    type="tertiary"
    :disabled="disabledActionSelected"
    @click="actionSelected">
    {{textActionSelected}}
  </FcButton>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

import { LocationMode, LocationSelectionType } from '@/lib/Constants';
import { getLocationByCentreline } from '@/lib/api/WebApi';
import CompositeId from '@/lib/io/CompositeId';
import FcButton from '@/web/components/inputs/FcButton.vue';

const SELECTABLE_LAYERS = [
  'studies',
  'intersections',
  'midblocks',
];

export default {
  name: 'FcMapPopupActionViewData',
  components: {
    FcButton,
  },
  props: {
    feature: Object,
  },
  computed: {
    disabledActionSelected() {
      if (this.locationMode === LocationMode.MULTI_EDIT) {
        if (this.featureLocationsEditIndex !== -1) {
          return false;
        }
        return this.locationsEditIndex === -1 && this.locationsEditFull;
      }
      return false;
    },
    featureLocationsEditIndex() {
      if (!this.featureSelectable) {
        return -1;
      }
      const { centrelineId, centrelineType } = this.feature.properties;
      return this.locationsEditSelection.locations.findIndex(
        location => location.centrelineType === centrelineType
          && location.centrelineId === centrelineId,
      );
    },
    featureSelectable() {
      return SELECTABLE_LAYERS.includes(this.feature.layer.id);
    },
    textActionSelected() {
      if (this.locationMode === LocationMode.MULTI_EDIT) {
        if (this.featureLocationsEditIndex !== -1) {
          return `Remove Location #${this.featureLocationsEditIndex + 1}`;
        }
        if (this.locationsEditIndex === -1) {
          return 'Add Location';
        }
        return `Set Location #${this.locationsEditIndex + 1}`;
      }
      return 'View Data';
    },
    ...mapState([
      'locationMode',
      'locationsEditIndex',
      'locationsEditSelection',
    ]),
    ...mapGetters([
      'locationsEditFull',
      'locationsForMode',
      'locationsSelectionForMode',
    ]),
  },
  methods: {
    actionRemoveLocationEdit() {
      const i = this.featureLocationsEditIndex;

      const { description } = this.locationsEditSelection.locations[i];
      this.setToastInfo(`Removed ${description} from selected locations.`);

      this.setLocationsEditIndex(-1);
      this.removeLocationEdit(i);
    },
    actionSelected() {
      if (this.locationMode === LocationMode.MULTI_EDIT) {
        if (this.featureLocationsEditIndex !== -1) {
          this.actionRemoveLocationEdit();
        } else {
          this.actionSetLocationEdit();
        }
      } else {
        this.actionViewData();
      }
    },
    async actionSetLocationEdit() {
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const location = await getLocationByCentreline(feature);

      if (this.locationsEditIndex === -1) {
        const { description } = location;
        this.setToastInfo(`Added ${description} to selected locations.`);
      }
      this.setLocationEdit(location);
    },
    actionViewData() {
      if (this.$route.name === 'viewDataAtLocation') {
        this.setDrawerOpen(true);
      }

      // open the view data window
      const { centrelineId, centrelineType } = this.feature.properties;
      const feature = { centrelineId, centrelineType };
      const s1 = CompositeId.encode([feature]);
      this.$router.push({
        name: 'viewDataAtLocation',
        params: { s1, selectionTypeName: LocationSelectionType.POINTS.name },
      });
    },
    ...mapMutations([
      'removeLocationEdit',
      'setLocationEdit',
      'setLocationsEditIndex',
      'setToastInfo',
    ]),
    ...mapMutations('viewData', ['setDrawerOpen']),
  },
};
</script>
