<template>
  <section class="mt-1 py-1">
    <div
      v-for="({ location, mostRecent, studyRequest }, i) in items"
      :key="i"
      class="align-center d-flex">

      <FcCardStudyRequest
        class="flex-grow-1 flex-shrink-1 mr-3 my-1 ml-5"
        :index="i"
        :location="location"
        :most-recent="mostRecent"
        :selected="internalValue.includes(i)"
        :study-request="studyRequest"
        :v="v.$each[i]"
        @action-edit-location="actionEditLocation(i)" />

      <FcButtonAria
        :aria-label="'Remove ' + location.description + ' from request'"
        :disabled="isRequestOneStudy"
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
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcCardStudyRequest from '@/web/components/requests/FcCardStudyRequest.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';
import { mapMutations } from 'vuex';

export default {
  name: 'FcStudyRequestBulkLocations',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcButtonAria,
    FcCardStudyRequest,
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
    isRequestOneStudy() {
      return this.items.length === 1;
    },
  },
  methods: {
    actionEditLocation(i) {
      this.internalValue = [i];
      this.setToastInfo('Set the study location using the map');
      this.$emit('action-focus-map');
    },
    ...mapMutations(['setToastInfo']),
  },
};
</script>
