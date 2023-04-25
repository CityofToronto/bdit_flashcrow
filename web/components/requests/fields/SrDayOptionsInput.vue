<template>
  <v-select
    class='day-options'
    v-model="modelValue"
    :items="dayValues"
    label="Day Options"
    :menu-props="{ closeOnContentClick: true, maxHeight: 206 }"
    multiple
    v-bind="$attrs"
    outlined>
    <template v-slot:selection="{ item, index }">
      <span v-if="index === 0">
        {{ getSelectionLabelFromValue(item) }}
      </span>
    </template>
    <template v-slot:item="{ item }">
      <v-list-item
        @click="modelValue = getAlternativeDaysOptionItemValue(item)"
        :class="{ blank: isBlankAlternativeDaysOption(item)}"
        class='alternative-days-option'>
        <v-list-item-content>
          <v-list-item-title>
            {{ getAlternativeDaysOptionItemLabel(item) }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ getAlternativeDaysOptionItemSubtitle(item) }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>
    <template v-slot:append-item>
      <v-hover v-slot:default="{ hover }">
        <v-list-group :value="hover">
          <template v-slot:activator>
            <v-list-item-title>Specific Day</v-list-item-title>
          </template>
          <v-list-item v-for="({ text, value }, i) in specificDayOptionsList" :key="i"
            @click="modelValue = value">
            <v-list-item-content>
              <v-list-item-title>{{ text }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-hover>
    </template>
  </v-select>
</template>

<script>

export default {
  name: 'SrDayOptionsInput',
  props: {
    v: Object,
  },
  data() {
    return {
      dayValues: [0, 1, 2, 3, 4, 5, 6],
      alternativeDaysOptionList: [
        {
          text: 'Regular Traffic Conditions',
          subtitle: 'Tue, Wed, or Thu',
          value: [2, 3, 4],
        },
        {
          text: 'Any Weekday',
          subtitle: 'Mon, Tue, Wed, Thu, or Fri',
          value: [1, 2, 3, 4, 5],
        },
        {
          text: 'Any Weekend Day',
          subtitle: 'Sat or Sun',
          value: [0, 6],
        },
      ],
      specificDayOptionsList: [
        {
          text: 'Sunday',
          value: [0],
        },
        {
          text: 'Monday',
          value: [1],
        },
        {
          text: 'Tuesday',
          value: [2],
        },
        {
          text: 'Wednesday',
          value: [3],
        },
        {
          text: 'Thursday',
          value: [4],
        },
        {
          text: 'Friday',
          value: [5],
        },
        {
          text: 'Satruday',
          value: [6],
        },
      ],
    };
  },
  computed: {
    modelValue: {
      get() {
        return this.v.daysOfWeek.$model;
      },
      set(daysOfWeek) {
        this.v.daysOfWeek.$model = daysOfWeek;
      },
    },
    isSpecificDaySelected() {
      return this.modelValue.length === 1;
    },
  },
  methods: {
    getAlternativeDaysOptionItemLabel(index) {
      let label = '';
      const options = this.alternativeDaysOptionList;
      if (index < options.length) label = options[index].text;
      return label;
    },
    getAlternativeDaysOptionItemSubtitle(index) {
      let subtitle = '';
      const options = this.alternativeDaysOptionList;
      if (index < options.length) subtitle = options[index].subtitle;
      return subtitle;
    },
    getAlternativeDaysOptionItemValue(index) {
      let value = null;
      const options = this.alternativeDaysOptionList;
      if (index < options.length) value = options[index].value;
      return value;
    },
    isBlankAlternativeDaysOption(index) {
      return this.getAlternativeDaysOptionItemLabel(index) === '';
    },
    getSelectionLabelFromValue(value) {
      let label = '';
      if (this.isSpecificDaySelected) {
        label = this.getSpecificDayLabelForValue(value);
      } else {
        label = this.getAlternativeDaysLabelByFirstValue(value);
      }
      return label;
    },
    getAlternativeDaysLabelByFirstValue(value) {
      const optionItem = this.alternativeDaysOptionList.find((item) => {
        const firstValue = item.value[0];
        return firstValue === value;
      });
      return optionItem.text;
    },
    getSpecificDayLabelForValue(value) {
      const optionItem = this.specificDayOptionsList.find((item) => {
        const itemValue = item.value[0];
        return itemValue === value;
      });
      return optionItem.text;
    },
  },
};
</script>

<style>

  .day-options .v-select__selections span {
    max-width: 180px;
    white-space: nowrap;
  }

  .blank.alternative-days-option {
    display: none !important;
  }
</style>
