<template>
  <div>
    <div v-for="(item, i) in studyRequests"
      :key="i">
      <v-divider class="px-0 my-3 mx-0" v-if="i > 0"></v-divider>
      <div class="d-flex align-center justify-space-between ml-2">
        <div class="flex-0 ml-2">
          <p
            v-for="(line, i) in getDescription(item)"
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
  computed: {
    studyRequests() {
      return JSON.parse(this.featureDetails.properties.studyRequests);
    },
  },
  methods: {
    getDescription(studyRequest) {
      const {
        requestId, requestType, requestHours, numDays,
      } = studyRequest;
      return [requestType, `#${requestId} · ${requestHours || numDays}`.concat(requestHours ? ' Hours' : ' Days')];
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
