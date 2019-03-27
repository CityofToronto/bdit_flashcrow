<template>
<svg
  class="breadcrumb-arrow"
  :class="{completed}"
  :height="height"
  :width="width"
  xmlns="http://www.w3.org/2000/svg">
  <circle :cx="size" :cy="size" :r="size" />
  <line :x1="size" :y1="size" :x2="width - size" :y2="size" />
  <path :d="pathArrow" />
</svg>
</template>

<script>
export default {
  name: 'BreadcrumbArrow',
  props: {
    completed: Boolean,
    height: Number,
    width: Number,
  },
  computed: {
    pathArrow() {
      const h = this.height;
      const s = this.size;
      const w = this.width;
      return `M${w - h},0 ${w - h},${h} ${w},${s}z`;
    },
    size() {
      return this.height / 2;
    },
  },
};
</script>

<style lang="postcss">
.breadcrumb-arrow {
  margin: 0 8px;
  circle, path {
    fill: #9b9b9b;
    stroke: none;
  }
  line {
    fill: none;
    stroke: #9b9b9b;
    stroke-width: 2px;
  }
}
</style>
