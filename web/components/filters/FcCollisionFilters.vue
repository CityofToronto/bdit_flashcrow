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
      <legend class="headline">Initial Impact Type</legend>

      <v-checkbox
        v-for="item in itemsImpactype"
        :key="item.value"
        v-model="internalValue.impactype"
        class="mt-2"
        hide-details
        :label="item.text"
        :value="item.value"></v-checkbox>
    </fieldset>

    <fieldset class="mt-6">
      <legend class="headline">Road Surface Condition</legend>

      <v-checkbox
        v-for="item in itemsRdsfcond"
        :key="item.value"
        v-model="internalValue.rdsfcond"
        class="mt-2"
        hide-details
        :label="item.text"
        :value="item.value"></v-checkbox>
    </fieldset>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import { CollisionEmphasisArea } from '@/lib/Constants';
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
    itemsImpactype() {
      const fieldEntries = this.collisionFactors.get('impactype');
      const items = Array.from(fieldEntries)
        .map(([value, { description }]) => ({
          value,
          text: description,
        }));
      return ArrayUtils.sortBy(items, ({ value }) => value);
    },
    itemsRdsfcond() {
      const fieldEntries = this.collisionFactors.get('rdsfcond');
      const items = Array.from(fieldEntries)
        .map(([value, { description }]) => ({
          value,
          text: description,
        }));
      return ArrayUtils.sortBy(items, ({ value }) => value);
    },
    ...mapState('viewData', ['collisionFactors']),
  },
};
</script>
