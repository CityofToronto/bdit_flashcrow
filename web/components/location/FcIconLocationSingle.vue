<template>
  <div
    class="fc-icon-location-single">
    <img
      :src="src"
      />
      <div class="overlay-text">
        {{ index + 1 }}
      </div>
  </div>
</template>

<script>
export default {
  props: {
    index: Number,
  },
  name: 'FcIconLocationSingle',
  computed: {
    src() {
      return '/icons/map/study-nonmatch.svg';
    },
  },
};
</script>

<style lang="scss">
.fc-icon-location-single {
  position: relative;
  display: inline-block;

  & > img {
    display: block;
  }

  & > .overlay-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #3088D6;
  font-weight: bolder;
  padding: 5px 10px;
  font-size: 20px;
  text-align: center;
  }
}
</style>
