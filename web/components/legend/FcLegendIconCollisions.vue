<template>
  <div class="fc-legend-icon-collisions">
    <div class="non-ksi"></div>
    <div class="ksi"></div>
  </div>
</template>

<script>
export default {
  name: 'FcLegendIconCollisions',
};
</script>

<style lang="scss">
.fc-legend-icon-collisions {
  height: 24px;
  position: relative;
  width: 24px;

  & > .non-ksi {
    background: #ef4848;
    border: 1px solid #733;
    border-radius: 6px;
    height: 12px;
    left: 4px;
    position: absolute;
    top: 4px;
    width: 12px;
  }

  & > .ksi {
    background: #ef4848;
    border: 3px solid #733;
    border-radius: 6px;
    bottom: 4px;
    height: 12px;
    position: absolute;
    right: 4px;
    width: 12px;
  }
}
</style>
