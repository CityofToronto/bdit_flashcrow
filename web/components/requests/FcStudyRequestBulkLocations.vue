<template>
  <section class="py-1">
    <div
      v-for="({ location, mostRecent, studyRequest }, i) in items"
      :key="i"
      class="align-center d-flex">
      <FcTooltip
        v-if="items.length > 1"
        right>
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-checkbox
              v-model="internalValue"
              :aria-label="'Select ' + location.description + ' for editing'"
              class="ml-5 mr-3"
              :value="i" />
          </div>
        </template>
        <span>Select {{location.description}} for editing</span>
      </FcTooltip>
      <div v-else class="mx-8"></div>

      <FcCardStudyRequest
        class="flex-grow-1 flex-shrink-1 mr-3 my-1"
        :index="i"
        :location="location"
        :most-recent="mostRecent"
        :selected="internalValue.includes(i)"
        :study-request="studyRequest"
        :v="v.$each[i]"
        @action-edit-location="actionEditLocation(i)" />

      <FcButtonAria
        :aria-label="'Remove ' + location.description + ' from request'"
        button-class="mr-2"
        right
        type="icon"
        @click="$emit('action-remove-study', i)">
        <v-icon>mdi-close</v-icon>
      </FcButtonAria>
    </div>
  </section>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcCardStudyRequest from '@/web/components/requests/FcCardStudyRequest.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkLocations',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcButtonAria,
    FcCardStudyRequest,
    FcTooltip,
  },
  props: {
    locations: Array,
    mostRecents: Array,
    studyRequests: Array,
    v: Object,
  },
  data() {
    return {
      locationToAdd: null,
    };
  },
  computed: {
    items() {
      return this.studyRequests.map((studyRequest, i) => {
        const location = this.locations[i];
        const mostRecent = this.mostRecents[i];
        return { location, mostRecent, studyRequest };
      });
    },
  },
  methods: {
    actionEditLocation(i) {
      this.internalValue = [i];
      this.$emit('action-focus-map');
    },
  },
};
</script>
