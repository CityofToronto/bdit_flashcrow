<template>
  <div>
    <div v-for="(studyRequest, i) in studyRequests" :key="i">
      <p
        v-for="(line, i) in getDescription(studyRequest)"
        :key="i"
        class="body-0 mb-0">
        {{line}}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FcPopupDetailsStudyRequest',
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
      return [requestType, `${requestId} · ${requestHours || numDays}`.concat(requestHours ? ' Hours' : ' Days')];
    },
  },
};
</script>
