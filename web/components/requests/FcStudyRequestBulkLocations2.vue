<template>
  <section class="min-height-fill py-1">
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
        class="flex-grow-1 flex-shrink-1 mr-5 my-1"
        :index="i"
        :location="location"
        :selected="internalValue.includes(i)"
        :study-request="studyRequest"
        :v="v.$each[i]" />
    </div>
  </section>
</template>

<script>
import FcTooltip from '@/web/components/dialogs/FcTooltip.vue';
import FcCardStudyRequest2 from '@/web/components/requests/FcCardStudyRequest2.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';

export default {
  name: 'FcStudyRequestBulkLocations',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcCardStudyRequest2,
    FcTooltip,
  },
  props: {
    locations: Array,
    studyRequests: Array,
    v: Object,
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
