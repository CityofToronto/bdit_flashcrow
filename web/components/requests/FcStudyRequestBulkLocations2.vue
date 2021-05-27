<template>
  <section class="py-1">
    <p
      v-if="studyRequests.length === 0"
      class="my-8 py-12 secondary--text text-center">
      No studies requested,<br>
      use the map to add a study at a location
    </p>

    <div
      v-for="({ location, studyRequest }, i) in items"
      :key="i"
      class="align-center d-flex">
      <FcTooltip right>
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

      <FcCardStudyRequest2
        class="flex-grow-1 flex-shrink-1 mr-3 my-1"
        :index="i"
        :location="location"
        :selected="internalValue.includes(i)"
        :study-request="studyRequest"
        :v="v.$each[i]" />

      <FcButtonAria
        :aria-label="'Remove ' + location.description + ' from request'"
        button-class="mr-2"
        right
        type="icon"
        @click="$emit('remove-study', i)">
        <v-icon>mdi-close</v-icon>
      </FcButtonAria>
    </div>
  </section>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcCardStudyRequest2 from '@/web/components/requests/FcCardStudyRequest2.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkLocations2',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcButtonAria,
    FcCardStudyRequest2,
    FcTooltip,
  },
  props: {
    locations: Array,
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
        return { location, studyRequest };
      });
    },
  },
};
</script>
