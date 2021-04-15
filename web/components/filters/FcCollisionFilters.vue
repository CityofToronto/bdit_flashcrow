<template>
  <div>
    <fieldset class="mt-4">
      <legend class="headline">Vision Zero Emphasis Areas</legend>

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
      v-model="internalValue"
      class="mt-6"
      :v="v" />

    <FcMvcrFieldFilter
      v-model="internalValue.drivact"
      class="mt-6"
      field-name="drivact"
      title="Driver Action" />

    <FcMvcrFieldFilter
      v-model="internalValue.drivcond"
      class="mt-6"
      field-name="drivcond"
      title="Driver Condition" />

    <FcMvcrFieldFilter
      v-model="internalValue.initdir"
      class="mt-6"
      field-name="initdir"
      title="Initial Direction of Travel" />

    <FcMvcrFieldFilter
      v-model="internalValue.impactype"
      class="mt-6"
      field-name="impactype"
      title="Initial Impact Type" />

    <FcMvcrFieldFilter
      v-model="internalValue.manoeuver"
      class="mt-6"
      field-name="manoeuver"
      title="Manoeuver" />

    <FcMvcrFieldFilter
      v-model="internalValue.rdsfcond"
      class="mt-6"
      field-name="rdsfcond"
      title="Road Surface Condition" />
  </div>
</template>

<script>
import { CollisionEmphasisArea } from '@/lib/Constants';
import FcFilterHoursOfDay from '@/web/components/filters/FcFilterHoursOfDay.vue';
import FcMvcrFieldFilter from '@/web/components/filters/FcMvcrFieldFilter.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcCollisionFilters',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcFilterHoursOfDay,
    FcMvcrFieldFilter,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      CollisionEmphasisArea,
    };
  },
};
</script>
