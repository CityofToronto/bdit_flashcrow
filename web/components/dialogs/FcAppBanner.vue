<template>
  <h1 :style="{color: color}">
    {{ message }}
  </h1>
</template>

<script>

export default {
  name: 'FcAppBanner',
  props: {
    color: String,
    message: String,
  },
};
</script>
