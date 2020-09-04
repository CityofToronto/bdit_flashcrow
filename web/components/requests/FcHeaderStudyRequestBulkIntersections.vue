<template>
  <div>
    <h3 class="headline mx-5">Select Intersections</h3>
    <div class="align-center d-flex mt-2 mx-5">
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
            <v-list-title>{{text}}</v-list-title>
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
            <v-list-title>{{text}}</v-list-title>
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
  name: 'FcHeaderStudyRequestBulkIntersections',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcButton,
  },
  props: {
    indicesIntersections: Array,
    studyRequests: Array,
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
        if (k === this.indicesIntersections.length) {
          return true;
        }
        return null;
      },
      set(selectAll) {
        if (selectAll) {
          this.internalValue = [...this.indicesIntersections];
        } else {
          this.internalValue = [];
        }
      },
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
