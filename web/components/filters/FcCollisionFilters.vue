<template>
  <div>
    <fieldset class="mt-4">
      <legend class="headline">Collision Affects</legend>

      <v-checkbox
        v-for="emphasisArea in CollisionEmphasisArea.enumValues"
        :key="emphasisArea.name"
        v-model="internalValue.emphasisAreas"
        class="mt-2"
        hide-details
        :label="emphasisArea.text"
        :value="emphasisArea"></v-checkbox>
    </fieldset>

    <FcFilterHoursOfDay
      v-model="internalValue.hoursOfDay"
      class="mt-6"
      :error-messages="errorMessagesHoursOfDay" />

    <fieldset class="mt-6">
      <legend class="headline">Weather</legend>

      <v-checkbox
        v-for="roadSurfaceCondition in CollisionRoadSurfaceCondition.enumValues"
        :key="roadSurfaceCondition.name"
        v-model="internalValue.roadSurfaceConditions"
        class="mt-2"
        hide-details
        :label="roadSurfaceCondition.text"
        :value="roadSurfaceCondition"></v-checkbox>
    </fieldset>
  </div>
</template>

<script>
import {
  CollisionEmphasisArea,
  CollisionRoadSurfaceCondition,
} from '@/lib/Constants';
import FcFilterHoursOfDay from '@/web/components/filters/FcFilterHoursOfDay.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcCollisionFilters',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcFilterHoursOfDay,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      CollisionEmphasisArea,
      CollisionRoadSurfaceCondition,
    };
  },
  computed: {
    errorMessagesHoursOfDay() {
      const errors = [];
      if (!this.v.hoursOfDay.fromBeforeTo) {
        errors.push('From hour must be before to hour');
      }
      return errors;
    },
  },
};
</script>
