<template>
  <div>
    <p
      v-for="(line, i) in description"
      :key="i"
      class="body-1 mb-1">
      {{line}}
    </p>
  </div>
</template>

<script>

export default {
  name: 'FcPopupDetailsStudyRequest',
  props: {
    featureDetails: Object,
  },
  computed: {
    description() {
      const {
        requestType, requestId, requestHours, numDays,
      } = this.featureDetails;
      return [`#${requestId} - ${requestType}`, (String(requestHours) === 'null' ? `${numDays} day`.concat(numDays > 1 ? 's' : '') : `${requestHours} hours`)];
    },
  },
};
</script>
