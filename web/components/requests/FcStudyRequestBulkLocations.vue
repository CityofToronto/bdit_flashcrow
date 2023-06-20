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

      <v-tooltip
        :disabled="!isRequestOneStudy"
        right>
        <template v-slot:activator="{ on, attrs }">
          <span
            class="remove-disabled-tooltip-trigger"
            :class="{ mute: !isRequestOneStudy }"
            v-bind="attrs" v-on="on">x</span>
          <FcButtonAria
            :aria-label="'Remove ' + location.description + ' from request'"
            :disabled="isRequestOneStudy"
            button-class="mr-2"
            right
            type="icon"
            @click="$emit('action-remove-study', i)">
            <v-icon>mdi-close</v-icon>
          </FcButtonAria>
        </template>
        <span>A request must include at least one study</span>
      </v-tooltip>
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

<style>
  .remove-disabled-tooltip-trigger {
    opacity: 0;
    position: relative;
    right: 30px;
  }

  .remove-disabled-tooltip-trigger:hover {
    cursor: default;
  }

  .remove-disabled-tooltip-trigger.mute {
    font-size: 0;
  }
</style>
