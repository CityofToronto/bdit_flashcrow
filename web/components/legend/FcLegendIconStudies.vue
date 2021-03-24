<template>
  <div class="fc-legend-icon-studies">
    <div class="non-matching"></div>
    <div class="matching"></div>
  </div>
</template>

<script>
export default {
  name: 'FcLegendIconStudies',
};
</script>

<style lang="scss">
.fc-legend-icon-studies {
  height: 24px;
  position: relative;
  width: 24px;

  & > .non-matching {
    background: rgba(64, 64, 64, 0.4);
    border: 1px solid #404040;
    border-radius: 8px;
    height: 16px;
    left: 1px;
    position: absolute;
    top: 1px;
    width: 16px;
  }

  & > .matching {
    background: linear-gradient(180deg, #9f92f3 0%, #5f48ef 100%);
    border: 1px solid #fff;
    border-radius: 9px;
    height: 18px;
    bottom: 1px;
    position: absolute;
    right: 1px;
    width: 18px;
  }
}
</style>
