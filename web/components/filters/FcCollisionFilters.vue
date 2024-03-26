<template>
  <div>
    <fieldset class="mt-4">
      <div class="align-center d-flex">
        <legend class="headline">Collision Details</legend>
        <v-spacer></v-spacer>
        <FcTooltipCollisionFilter>
          <span>
             These are properties of the collision that are specific to Transportation Services,
             or that have been calculated from the data collected by Toronto Police Services and
             Collision Reporting Centres.
          </span>
        </FcTooltipCollisionFilter>
      </div>

      <div
        v-for="detail in CollisionDetail.enumValues"
        :key="detail.name"
        class="align-center d-flex">
        <v-checkbox
          v-model="internalValue.details"
          class="mt-0"
          hide-details
          :label="detail.text"
          :value="detail"></v-checkbox>
        <v-spacer></v-spacer>
        <FcTooltipCollisionFilter>
          <span v-html="detail.tooltip"></span>
        </FcTooltipCollisionFilter>
      </div>
    </fieldset>

    <FcRadioGroup
      v-model="internalValue.validated"
      class="mt-6"
      hide-details
      :items="[
        { label: 'Verified', value: true },
        { label: 'Not Verified', value: false },
        { label: 'All', value: null },
      ]"
      label="Verification">
      <template v-slot:label-right>
        <FcTooltipCollisionFilter>
          <span>
            Some collisions have been verified by Transportation Services staff, who check
            that the descriptions and diagrams on the original collision report were entered
            correctly.
          </span>
        </FcTooltipCollisionFilter>
      </template>
    </FcRadioGroup>

    <FcRadioGroup
      v-model="internalValue.mvcr"
      class="mt-6"
      hide-details
      :items="[
        { label: 'MVCR Available', value: true },
        { label: 'MVCR Missing', value: false },
        { label: 'All', value: null },
      ]"
      label="MVCR">
      <template v-slot:label-right>
        <FcTooltipCollisionFilter>
          <span>
            Many collisions have an associated Motor Vehicle Collision Report (MVCR) on record.
            The MVCR was previously known as the MVA report.<br><br>
            This report includes detailed information about a collision.
            Toronto Police Services and Collision Reporting Centres share these reports
            with Transportation Services for use in safety and mobility analyses.
          </span>
        </FcTooltipCollisionFilter>
      </template>
    </FcRadioGroup>

    <fieldset class="mt-8">
      <legend class="headline mb-2">Vision Zero Emphasis Areas</legend>

      <div
        v-for="emphasisArea in CollisionEmphasisArea.enumValues"
        :key="emphasisArea.name"
        class="align-center d-flex">
        <v-checkbox
          v-model="internalValue.emphasisAreas"
          class="mt-0"
          hide-details
          :label="emphasisArea.text"
          :value="emphasisArea"></v-checkbox>
        <v-spacer></v-spacer>
        <FcTooltipCollisionFilter
          v-if="emphasisArea.tooltip !== null">
          <span v-html="emphasisArea.tooltip"></span>
        </FcTooltipCollisionFilter>
      </div>
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
      title="Manoeuvre" />

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
import FcTooltipCollisionFilter from '@/web/components/filters/FcTooltipCollisionFilter.vue';
import FcRadioGroup from '@/web/components/inputs/FcRadioGroup.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcCollisionFilters',
  mixins: [FcMixinVModelProxy(Object)],
  components: {
    FcFilterHoursOfDay,
    FcMvcrFieldFilter,
    FcRadioGroup,
    FcTooltipCollisionFilter,
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
