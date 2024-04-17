<template>
  <div>
    <v-list>
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        class="body-1 mb-1">
        <p
          v-for="(line, i) in generateDescription(item)"
          :key="i">
          {{line}}
        </p>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>

export default {
  name: 'FcPopupDetailsStudyRequest',
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
    description() {
      if ('studyRequests' in this.featureDetails) {
        return ['something'];
      }
      return this.generateSingleRequest();
    },
  },
  methods: {
    generateSingleRequest() {
      const {
        requestType, requestId, requestHours, numDays,
      } = this.featureDetails;
      return [`#${requestId} - ${requestType}`, (String(requestHours) === 'null' ? `${numDays} day`.concat(numDays > 1 ? 's' : '') : `${requestHours} hours`)];
    },
    generateDescription(studyRequest) {
      const {
        requestType, requestId, requestHours, numDays,
      } = studyRequest;
      return [`#${requestId} - ${requestType}`, (String(requestHours) === 'null' ? `${numDays} day`.concat(numDays > 1 ? 's' : '') : `${requestHours} hours`)];
    },
  },
};
</script>
