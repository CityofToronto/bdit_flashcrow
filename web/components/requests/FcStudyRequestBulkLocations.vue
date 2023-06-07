<template>
  <section class="py-1">
    <div
      v-for="({ location, mostRecent, studyRequest }, i) in items"
      :key="i"
      class="align-center d-flex">

      <FcCardStudyRequest
        class="flex-grow-1 flex-shrink-1 mr-3 my-1 ml-3"
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
    <FcButton
      class="mr-3 mt-4 mb-4 add-request"
      type="secondary"
      @click="addStudyRequest">
      <v-icon color="primary" class="mr-2" small>mdi-plus-box</v-icon>
      Add Study
    </FcButton>
  </section>
</template>

<script>
import FcButtonAria from '@/web/components/inputs/FcButtonAria.vue';
import FcButton from '@/web/components/inputs/FcButton.vue';
import FcCardStudyRequest from '@/web/components/requests/FcCardStudyRequest.vue';
import FcMixinVModelProxy from '@/web/mixins/FcMixinVModelProxy';
import { mapMutations, mapActions } from 'vuex';

export default {
  name: 'FcStudyRequestBulkLocations',
  mixins: [FcMixinVModelProxy(Array)],
  components: {
    FcButtonAria,
    FcButton,
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
  },
  methods: {
    async addStudyRequest() {
      const lastRequest = this.items[this.items.length - 1];
      const { location } = lastRequest;
      this.setToastInfo(`Added study at ${location.description}`);
      this.addStudyRequestAtLocation(location);
    },
    actionEditLocation(i) {
      this.internalValue = [i];
      this.setToastInfo('Set the study location using the map');
      this.$emit('action-focus-map');
    },
    ...mapMutations(['setToastInfo']),
    ...mapActions('editRequests', ['addStudyRequestAtLocation']),
  },
};
</script>

<style>
  button.add-request {
    float: right;
  }
</style>
