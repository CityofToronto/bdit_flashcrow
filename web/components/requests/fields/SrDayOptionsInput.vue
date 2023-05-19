<template>
  <v-select
    class='day-options'
    v-model="modelValue"
    :items="dayValues"
    :messages="caption"
    label="Day Options"
    :menu-props="{ closeOnContentClick: true, maxHeight: 206 }"
    multiple
    v-bind="$attrs"
    outlined>
    <template v-slot:selection="{ index }">
      <span v-if="index === 0">
        {{ selectedOptionItem.text }}
      </span>
    </template>
    <template v-slot:item="{ item }">
      <v-list-item
        @click="modelValue = alternativeDaysOptionItemByIndex(item).value"
        :class="{ blank: alternativeDaysOptionItemByIndex(item).value === null}"
        class='alternative-days-option'>
        <v-list-item-content>
          <v-list-item-title>
            {{ alternativeDaysOptionItemByIndex(item).text }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ alternativeDaysOptionItemByIndex(item).subtitle }}
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
import _ from 'underscore';

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
          subtitle: 'Tuesday, Wednesday, or Thursday',
          value: [2, 3, 4],
        },
        {
          text: 'Any Weekday',
          subtitle: 'Monday, Tuesday, Wednesday, Thursday, or Friday',
          value: [1, 2, 3, 4, 5],
        },
        {
          text: 'Any Weekend Day',
          subtitle: 'Saturday or Sunday',
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
          text: 'Saturday',
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
    selectedOptionItem() {
      const currentValue = this.modelValue;
      let item;
      if (this.isSpecificDaySelected) {
        item = this.specificDayOptionsList.find(i => i.value[0] === currentValue[0]);
      } else {
        const alternateItem = this.alternativeDaysOptionList
          .find(i => _.difference(currentValue, i.value).length === 0);
        if (alternateItem) {
          item = alternateItem;
        } else {
          item = {
            text: 'Custom Days',
            subtitle: this.customDaysSubtitle(currentValue),
          };
        }
      }
      return item;
    },
    caption() {
      const mainClause = 'The study will be conducted on a';
      const item = this.selectedOptionItem;
      let caption = '';
      if (this.isSpecificDaySelected) {
        caption = `${mainClause} ${item.text}`;
      } else {
        caption = `${mainClause} ${item.subtitle}`;
      }
      return caption;
    },
  },
  methods: {
    alternativeDaysOptionItemByIndex(index) {
      let item = {
        text: '',
        subtitle: '',
        value: null,
      };
      const options = this.alternativeDaysOptionList;
      if (index < options.length) item = options[index];
      return item;
    },
    customDaysSubtitle(dayIndicies) {
      const lastDayIndex = dayIndicies.pop();
      const lastDay = this.specificDayOptionsList[lastDayIndex].text;
      let subtitle = dayIndicies.map(i => this.specificDayOptionsList[i].text).join(', ');
      subtitle = `${subtitle}, or ${lastDay}`;
      return subtitle;
    },
  },
};
</script>

<style>
  .day-options .v-select__selections span {
    max-width: 170px;
    white-space: nowrap;
  }

  .blank.alternative-days-option {
    display: none !important;
  }
</style>
