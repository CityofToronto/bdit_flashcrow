<template>
  <div>
    <div v-for="(item, i) in items"
      :key="i"
    @click="viewRequest(item)">
    <v-divider class="mb-1" v-if="i > 0"></v-divider>
        <p
          v-for="(line, i) in generateDescription(item)"
          :key="i"
          class="body-1 mb-1">
          {{line}}
        </p>
        <FcButton @click="viewRequest(item)" type="secondary"
        button-class="btn-show-request" right><v-icon>mdi-open-in-new</v-icon></FcButton>
    </div>
  </div>
</template>

<script>
import FcButton from '../../inputs/FcButton.vue';

export default {
  name: 'FcPopupDetailsStudyRequest',
  components: {
    FcButton,
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
      return [`#${requestId} - ${requestType}`, (String(requestHours) === 'null' ? `${numDays} day`.concat(numDays > 1 ? 's' : '') : `${requestHours} hours`)];
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
