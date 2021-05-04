<template>
  <fieldset>
    <div class="align-center d-flex">
      <legend class="default--text headline">{{title}}</legend>
      <v-spacer></v-spacer>
      <FcTooltipCollisionFilter
        v-if="tooltip !== null">
        <span v-html="tooltip"></span>
      </FcTooltipCollisionFilter>
    </div>

    <template v-for="item in items">
      <div
        v-if="item.children === null"
        :key="item.key"
        class="align-center d-flex">
        <v-checkbox
          v-model="internalValue"
          :class="item.tooltip === null ? 'mt-2' : 'mt-0'"
          hide-details
          :label="item.text"
          :value="item.value" />
        <v-spacer></v-spacer>
        <FcTooltipCollisionFilter
          v-if="item.tooltip !== null">
          <span v-html="item.tooltip"></span>
        </FcTooltipCollisionFilter>
      </div>
      <fieldset
        v-else
        :key="item.key">
        <div class="align-center d-flex">
          <v-checkbox
            v-model="selectAll[item.key]"
            :class="item.tooltip === null ? 'mt-2' : 'mt-0'"
            hide-details
            :indeterminate="selectAll[item.key] === null"
            :input-value="selectAll[item.key]"
            :label="item.text"
            @click="actionSelectAll(item)" />
          <v-spacer></v-spacer>
          <FcTooltipCollisionFilter
            v-if="item.tooltip !== null">
            <span v-html="item.tooltip"></span>
          </FcTooltipCollisionFilter>
        </div>

        <div class="ml-6">
          <div
            v-for="subitem in item.children"
            :key="subitem.key"
            class="align-center d-flex">
            <v-checkbox
              v-model="internalValue"
              :class="subitem.tooltip === null ? 'mt-2' : 'mt-0'"
              hide-details
              :label="subitem.text"
              :value="subitem.value" />
            <v-spacer></v-spacer>
            <FcTooltipCollisionFilter
              v-if="subitem.tooltip !== null">
              <span v-html="subitem.tooltip"></span>
            </FcTooltipCollisionFilter>
          </div>
        </div>
      </fieldset>
    </template>
  </fieldset>
</template>

<script>
import { mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import FcTooltipCollisionFilter from '@/web/components/filters/FcTooltipCollisionFilter.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

const MVCR_FIELD_TOOLTIPS = {
  injury: {
    field: '<span>Severity of injuries sustained as a result of the collision event.</span>',
    items: new Map([
      [
        'KSI',
        `
<span>A traffic collision where a person was killed or seriously injured. Reducing KSI collisions
is the primary goal of the Vision Zero program.</span>`,
      ],
      [
        4,
        `
Fatal injury (person sustains bodily injuries resulting in death) only in those cases where
death occurs in less than 366 days as result of the collision. Does not include death
from natural causes (heart attack, stroke, epilated seizure, etc.) or suicide.`,
      ],
      [
        3,
        `
A non-fatal injury that is severe enough to require the injured person to be admitted to hospital,
even if only for observation at the time of the collision. Includes: fracture, internal injury,
severe cuts, crushing, burns, concussion, severe general shocks.`,
      ],
      [
        2,
        `
A non-fatal injury requiring medical treatment at a hospital emergency room, but not requiring
hospitalization of the involved person at the time of the collision.`,
      ],
      [
        1,
        `
A non-fatal injury at the time of the collision, including minor abrasions, bruises, and
complaints of pain which does not require the injured person going to the hospital.`,
      ],
      [0, 'No injuries'],
    ]),
  },
};

function getFieldTooltip(fieldName) {
  if (!Object.prototype.hasOwnProperty.call(MVCR_FIELD_TOOLTIPS, fieldName)) {
    return null;
  }
  return MVCR_FIELD_TOOLTIPS[fieldName].field;
}

function getItemTooltip(fieldName, key) {
  if (!Object.prototype.hasOwnProperty.call(MVCR_FIELD_TOOLTIPS, fieldName)) {
    return null;
  }
  const { items } = MVCR_FIELD_TOOLTIPS[fieldName];
  if (!items.has(key)) {
    return null;
  }
  return items.get(key);
}

function getFieldCodes(fieldName, fieldEntries) {
  if (fieldName === 'injury') {
    return [{ key: 'KSI', text: 'KSI', values: [4, 3] }, 2, 1, 0];
  }
  if (fieldName === 'vehtype') {
    return [
      1,
      2,
      36,
      3,
      4,
      5,
      6,
      { key: 'TRUCKS', text: 'Trucks', values: [7, 8, 9, 10, 11, 12, 13, 98] },
      { key: 'BUSES', text: 'Buses', values: [14, 15, 16] },
      { key: 'SCHOOL', text: 'School vehicles', values: [17, 18, 19] },
      20,
      { key: 'OFF_ROAD', text: 'Off-road vehicles', values: [21, 22, 23, 24] },
      { key: 'SPECIAL', text: 'Specialized vehicles', values: [25, 26, 27, 28] },
      29,
      30,
      31,
      { key: 'EMS', text: 'Emergency vehicles', values: [32, 33, 34, 35] },
      99,
    ];
  }

  let fieldCodes = [];
  let hasOther = false;
  let hasUnknown = false;
  Array.from(fieldEntries).forEach(([value]) => {
    if (value === 99) {
      hasOther = true;
    } else if (value === 0) {
      hasUnknown = true;
    } else {
      fieldCodes.push(value);
    }
  });
  fieldCodes = ArrayUtils.sortBy(fieldCodes, value => value);
  if (hasOther) {
    fieldCodes.push(99);
  }
  if (hasUnknown) {
    fieldCodes.push(0);
  }
  return fieldCodes;
}

function isLeafFieldCode(fieldCode) {
  return Number.isInteger(fieldCode);
}

function getLeafItem(fieldName, fieldEntries, fieldCode) {
  const { description: text } = fieldEntries.get(fieldCode);
  const tooltip = getItemTooltip(fieldName, fieldCode);
  return {
    children: null,
    key: fieldCode,
    text,
    tooltip,
    value: fieldCode,
  };
}

function getGroupItem(fieldName, fieldEntries, fieldCodeGroup) {
  const { key, text, values } = fieldCodeGroup;
  const tooltip = getItemTooltip(fieldName, key);
  const children = values.map(
    value => getLeafItem(fieldName, fieldEntries, value),
  );
  return {
    children,
    key,
    text,
    tooltip,
    values,
  };
}

function getSelectAll(internalValue, item) {
  let k = 0;
  item.values.forEach((value) => {
    if (internalValue.includes(value)) {
      k += 1;
    }
  });
  if (k === 0) {
    return false;
  }
  if (k === item.values.length) {
    return true;
  }
  return null;
}

export default {
  name: 'FcMvcrFieldFilter',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcTooltipCollisionFilter,
  },
  props: {
    fieldName: String,
    title: String,
  },
  data() {
    const tooltip = getFieldTooltip(this.fieldName);
    return { tooltip };
  },
  computed: {
    items() {
      const fieldEntries = this.collisionFactors.get(this.fieldName);
      const fieldCodes = getFieldCodes(this.fieldName, fieldEntries);
      return fieldCodes.map((fieldCode) => {
        if (isLeafFieldCode(fieldCode)) {
          return getLeafItem(this.fieldName, fieldEntries, fieldCode);
        }
        return getGroupItem(this.fieldName, fieldEntries, fieldCode);
      });
    },
    selectAll() {
      const selectAll = {};
      this.items.forEach((item) => {
        if (item.children === null) {
          return;
        }
        selectAll[item.key] = getSelectAll(this.internalValue, item);
      });
      return selectAll;
    },
    ...mapState('viewData', ['collisionFactors']),
  },
  methods: {
    actionSelectAll(item) {
      const selectAll = getSelectAll(this.internalValue, item);
      if (selectAll === true) {
        // deselect all in group
        item.values.forEach((value) => {
          const i = this.internalValue.indexOf(value);
          if (i !== -1) {
            this.internalValue.splice(i, 1);
          }
        });
      } else {
        // select all in group
        item.values.forEach((value) => {
          const i = this.internalValue.indexOf(value);
          if (i === -1) {
            this.internalValue.push(value);
          }
        });
      }
    },
  },
};
</script>
