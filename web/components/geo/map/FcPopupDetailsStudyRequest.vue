<template>
  <div>
    <div v-for="(item, i) in items"
      :key="i">
      <v-divider class="px-0 my-3" v-if="i > 0"></v-divider>
      <div class="d-flex align-center justify-space-between">
        <div class="flex-0 ml-3">
          <p
            v-for="(line, i) in generateDescription(item)"
            :key="i"
            class="body-0 mb-0">
            {{line}}
          </p>
        </div>
        <FcButtonAria @click="viewRequest(item)" type="tertiary"
        button-class="btn-show-request" right small
        :aria-label="'View Request'"><v-icon>mdi-open-in-new</v-icon></FcButtonAria>
      </div>
    </div>
  </div>
</template>

<script>
import FcButtonAria from '../../inputs/FcButtonAria.vue';

export default {
  name: 'FcPopupDetailsStudyRequest',
  components: {
    FcButtonAria,
  },
  props: {
    featureDetails: Object,
  },
  data() {
    return {
      selectedItem: null,
    };
  },
  computed: {
    items() {
      const items = Object.values(this.featureDetails.studyRequests);
      return items;
    },
  },
  methods: {
    generateDescription(studyRequest) {
      const {
        requestType, requestId, requestHours, numDays,
      } = studyRequest;
      return [`#${requestId}`, `${requestType}`, (String(requestHours) === 'null' ? `${numDays} day`.concat(numDays > 1 ? 's' : '') : `${requestHours} Hours`)];
    },
    viewRequest(request) {
      const { requestId } = request;
      const route = {
        name: 'requestStudyView',
        params: { id: requestId },
      };
      this.$router.push(route);
    },
  },
};
</script>
