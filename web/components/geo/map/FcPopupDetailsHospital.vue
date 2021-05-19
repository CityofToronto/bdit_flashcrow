<template>
  <div>
    <p class="body-1 mb-1">
      {{featureDetails.properties.name}}
    </p>
  </div>
</template>

<script>
export default {
  name: 'FcPopupDetailsHospital',
  props: {
    featureDetails: Object,
  },
};
</script>
