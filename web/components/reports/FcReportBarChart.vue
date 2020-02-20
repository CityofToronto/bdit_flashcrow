<template>
  <div class="fc-report-bar-chart">
    <!-- SVG injected here -->
  </div>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import { select } from 'd3-selection';
import Vue from 'vue';

import BarChartGenerator from '@/lib/reports/svg/BarChartGenerator';

export default {
  name: 'FcReportBarChart',
  props: {
    data: Array,
    labelAxisX: {
      type: String,
      default: null,
    },
    labelAxisY: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
  },
  watch: {
    data() {
      this.generator.update();
    },
  },
  mounted() {
    Vue.nextTick(() => {
      this.updateSize();

      const container = select(this.$el);
      const options = {
        data: this.data,
        labelAxisX: this.labelAxisX,
        labelAxisY: this.labelAxisY,
        title: this.title,
      };
      const barChartOptions = {
        width: this.pixelsWidth,
        height: this.pixelsHeight,
        ...options,
      };
      this.generator = new BarChartGenerator(container, barChartOptions);
      this.generator.init();
      this.generator.update();
      window.onresize = this.onResize.bind(this);
    });
  },
  methods: {
    onResize() {
      this.updateSize();
      this.generator.update();
    },
    updateSize() {
      this.pixelsHeight = this.$el.clientHeight;
      this.pixelsWidth = this.$el.clientWidth;
    },
  },
};
</script>

<style lang="scss">
.fc-report-bar-chart {
  height: calc(var(--space-3xl) * 4);
  & > svg {
    & rect.bar {
      fill: var(--v-secondary-base);
    }
    & .tick {
      font-size: var(--font-size-m);
    }
  }
}
</style>
