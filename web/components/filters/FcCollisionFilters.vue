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
