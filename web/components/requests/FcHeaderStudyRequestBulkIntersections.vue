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
            type="secondary">
            <span>Study Type</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item>
            <v-list-title>Foo</v-list-title>
          </v-list-item>
          <v-list-item>
            <v-list-title>Bar</v-list-title>
          </v-list-item>
          <v-list-item>
            <v-list-title>Baz</v-list-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            class="ml-2"
            type="secondary">
            <span>Reason</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item>
            <v-list-title>Foo</v-list-title>
          </v-list-item>
          <v-list-item>
            <v-list-title>Bar</v-list-title>
          </v-list-item>
          <v-list-item>
            <v-list-title>Baz</v-list-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            class="ml-2"
            type="secondary">
            <span>Days</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item>
            <v-list-title>Foo</v-list-title>
          </v-list-item>
          <v-list-item>
            <v-list-title>Bar</v-list-title>
          </v-list-item>
          <v-list-item>
            <v-list-title>Baz</v-list-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu>
        <template v-slot:activator="{ on, attrs }">
          <FcButton
            v-bind="attrs"
            v-on="on"
            class="ml-2"
            type="secondary">
            <span>Hours</span>
            <v-icon right>mdi-menu-down</v-icon>
          </FcButton>
        </template>
        <v-list>
          <v-list-item>
            <v-list-title>Foo</v-list-title>
          </v-list-item>
          <v-list-item>
            <v-list-title>Bar</v-list-title>
          </v-list-item>
          <v-list-item>
            <v-list-title>Baz</v-list-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
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
};
</script>
