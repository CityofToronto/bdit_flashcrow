<template>
  <fieldset>
    <legend class="headline">{{title}}</legend>

    <template v-for="item in items">
      <v-checkbox
        v-if="item.children === null"
        :key="item.key"
        v-model="internalValue"
        class="mt-2"
        hide-details
        :label="item.text"
        :value="item.value" />
      <fieldset
        v-else
        :key="item.key">
        <v-checkbox
          v-model="selectAll[item.key]"
          class="mt-2"
          hide-details
          :indeterminate="selectAll[item.key] === null"
          :input-value="selectAll[item.key]"
          :label="item.text"
          @click="actionSelectAll(item)" />

        <div class="ml-6">
          <v-checkbox
            v-for="subitem in item.children"
            :key="subitem.key"
            v-model="internalValue"
            class="mt-2"
            hide-details
            :label="subitem.text"
            :value="subitem.value" />
        </div>
      </fieldset>
    </template>
  </fieldset>
</template>

<script>
import { mapState } from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

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
  return {
    children: null,
    key: fieldCode,
    text,
    value: fieldCode,
  };
}

function getGroupItem(fieldName, fieldEntries, fieldCodeGroup) {
  const { key, text, values } = fieldCodeGroup;
  const children = values.map(
    value => getLeafItem(fieldName, fieldEntries, value),
  );
  return {
    children,
    key,
    text,
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
  props: {
    fieldName: String,
    title: String,
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
