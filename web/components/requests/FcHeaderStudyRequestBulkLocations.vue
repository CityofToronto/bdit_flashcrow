<template>
  <div class="mx-5">
    <h3 class="headline">{{title}} &#x2022; {{subtitle}}</h3>
    <div class="align-center d-flex">
      <v-checkbox
        v-model="selectAll"
        class="mr-6"
        label="Select all"
        :indeterminate="selectAll === null" />

      <v-spacer></v-spacer>

      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            :disabled="selectAll === false"
            type="secondary">
            <span>Study Type</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item
            v-for="({ text, value }, i) in itemsStudyType"
            :key="i"
            @click="actionSetStudyType(value)">
            <v-list-item-title>{{text}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            class="ml-2"
            :disabled="selectAll === false"
            type="secondary">
            <span>Hours</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item
            v-for="({ text, value }, i) in itemsHours"
            :key="i"
            @click="actionSetHours(value)">
            <v-list-item-title>{{text}}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
import ArrayUtils from '@/lib/ArrayUtils';
import { StudyHours, StudyType } from '@/lib/Constants';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcHeaderStudyRequestBulkLocations',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcButton,
  },
  props: {
    indices: Array,
    studyRequests: Array,
    title: String,
  },
  computed: {
    itemsHours() {
      return StudyHours.enumValues.map((value) => {
        const { description } = value;
        return { text: description, value };
      });
    },
    itemsStudyType() {
      const itemsStudyType = StudyType.enumValues.map((studyType) => {
        const { label } = studyType;
        return { text: label, value: studyType };
      });
      return ArrayUtils.sortBy(itemsStudyType, ({ label }) => label);
    },
    selectAll: {
      get() {
        const k = this.internalValue.length;
        if (k === 0) {
          return false;
        }
        if (k === this.indices.length) {
          return true;
        }
        return null;
      },
      set(selectAll) {
        if (selectAll) {
          this.internalValue = [...this.indices];
        } else {
          this.internalValue = [];
        }
      },
    },
    subtitle() {
      const k = this.internalValue.length;
      const n = this.indices.length;
      return `${k} / ${n} selected`;
    },
  },
  methods: {
    actionSetHours(hours) {
      this.internalValue.forEach((i) => {
        this.studyRequests[i].hours = hours;
      });
    },
    actionSetStudyType(studyType) {
      this.internalValue.forEach((i) => {
        this.studyRequests[i].studyType = studyType;
      });
    },
  },
};
</script>
