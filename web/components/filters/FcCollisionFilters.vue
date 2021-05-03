<template>
  <div>
    <fieldset class="mt-4">
      <legend class="headline">Collision Details</legend>

      <v-checkbox
        v-for="detail in CollisionDetail.enumValues"
        :key="detail.name"
        v-model="internalValue.details"
        class="mt-2"
        hide-details
        :label="detail.text"
        :value="detail"></v-checkbox>
    </fieldset>

    <FcRadioGroup
      v-model="internalValue.validated"
      class="mt-6"
      hide-details
      :items="[
        { label: 'Validated', value: true },
        { label: 'Not Validated', value: false },
        { label: 'All', value: null },
      ]"
      label="Validation" />

    <FcRadioGroup
      v-model="internalValue.mvcr"
      class="mt-6"
      hide-details
      :items="[
        { label: 'MVCR Available', value: true },
        { label: 'MVCR Missing', value: false },
        { label: 'All', value: null },
      ]"
      label="MVCR" />

    <fieldset class="mt-6">
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

    <FcMvcrFieldFilter
      v-model="internalValue.injury"
      class="mt-6"
      field-name="injury"
      title="Injuries" />

    <FcFilterHoursOfDay
      v-model="internalValue"
      class="mt-6"
      :v="v" />

    <FcMvcrFieldFilter
      v-model="internalValue.manoeuver"
      class="mt-6"
      field-name="manoeuver"
      title="Manoeuver" />

    <FcMvcrFieldFilter
      v-model="internalValue.impactype"
      class="mt-6"
      field-name="impactype"
      title="Initial Impact Type" />

    <FcMvcrFieldFilter
      v-model="internalValue.drivact"
      class="mt-6"
      field-name="drivact"
      title="Driver Action" />

    <FcMvcrFieldFilter
      v-model="internalValue.drivcond"
      class="mt-6"
      field-name="drivcond"
      title="Driver Conditions" />

    <FcMvcrFieldFilter
      v-model="internalValue.rdsfcond"
      class="mt-6"
      field-name="rdsfcond"
      title="Weather" />

    <FcMvcrFieldFilter
      v-model="internalValue.initdir"
      class="mt-6"
      field-name="initdir"
      title="Initial Direction of Travel" />

    <FcMvcrFieldFilter
      v-model="internalValue.vehtype"
      class="mt-6"
      field-name="vehtype"
      title="Vehicle Type" />
  </div>
</template>

<script>
import {
  CollisionDetail,
  CollisionEmphasisArea,
} from '@/lib/Constants';
import FcFilterHoursOfDay from '@/web/components/filters/FcFilterHoursOfDay.vue';
import FcMvcrFieldFilter from '@/web/components/filters/FcMvcrFieldFilter.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcCollisionFilters',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcFilterHoursOfDay,
    FcMvcrFieldFilter,
    FcRadioGroup,
  },
  props: {
    v: Object,
  },
  data() {
    return {
      CollisionDetail,
      CollisionEmphasisArea,
    };
  },
};
</script>
