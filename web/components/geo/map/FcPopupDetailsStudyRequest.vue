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
      return ['Hello'];
    },
  },
};
</script>
