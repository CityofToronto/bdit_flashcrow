<template>
  <div>
    <div v-for="(item, i) in items"
      :key="i">
      <v-divider class="px-0 my-3" v-if="i > 0"></v-divider>
      <div class="d-flex align-center">
        <div class="flex-0 ml-3">
          <p
            v-for="(line, i) in generateDescription(item)"
            :key="i"
            class="body-1 mb-1">
            {{line}}
          </p>
        </div>
        <FcButton class="flex-1" @click="viewRequest(item)" type="tertiary"
        button-class="btn-show-request" right small><v-icon>mdi-open-in-new</v-icon></FcButton>
      </div>
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
      return [`#${requestId} · ${requestType} · `.concat(String(requestHours) === 'null' ? `${numDays} Day`.concat(numDays > 1 ? 's' : '') : `${requestHours} Hours`)];
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
