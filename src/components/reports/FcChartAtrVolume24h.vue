<template>
  <div class="fc-chart-atr-volume-24h">
    <svg
      ref="svg"
      :height="pixelsHeight"
      :viewBox="viewBox"
      :width="pixelsWidth"
      xmlns="http://www.w3.org/2000/svg"></svg>
  </div>
</template>

<script>
/* eslint-disable no-underscore-dangle */
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import 'd3-selection-multi';
import Vue from 'vue';

export default {
  name: '',
  props: {
    aspectRatio: {
      type: Number,
      default: 16 / 9,
    },
    chartData: {
      type: Array,
      default() { return []; },
    },
    value: Number,
  },
  data() {
    return {
      pixelsHeight: 0,
      pixelsWidth: 0,
      unitsHeight: 960 / this.aspectRatio,
      unitsHeightAxis: 64,
      unitsWidth: 960,
      unitsWidthAxis: 80,
    };
  },
  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
    unitsHeightBars() {
      return this.unitsHeight - this.unitsHeightAxis;
    },
    unitsWidthBars() {
      return this.unitsWidth - this.unitsWidthAxis;
    },
    viewBox() {
      return `0 0 ${this.unitsWidth} ${this.unitsHeight}`;
    },
  },
  watch: {
    chartData() {
      this.updateChart();
    },
    internalValue() {
      this.updateChart();
    },
  },
  mounted() {
    Vue.nextTick(() => {
      this.onResize();
      this.initChart();
      this.updateChart();
      window.onresize = this.onResize.bind(this);
    });
  },
  methods: {
    initChart() {
      const svg = select(this.$refs.svg);
      this._groupBars = svg.append('g')
        .attr('transform', `translate(${this.unitsWidthAxis}, 0)`)
        .on('mouseleave', () => {
          this.internalValue = null;
        });
      this._groupAxisX = svg.append('g')
        .attr('transform', `translate(${this.unitsWidthAxis}, ${this.unitsHeightBars})`);
      this._groupAxisY = svg.append('g')
        .attr('transform', `translate(${this.unitsWidthAxis}, 0)`);
      this._scaleX = scaleBand()
        .range([0, this.unitsWidthBars])
        .padding(0.05);
      this._scaleY = scaleLinear()
        .range([this.unitsHeightBars, 0]);
      this._axisX = axisBottom(this._scaleX)
        .tickSize(0)
        .tickPadding(8);
      this._axisY = axisLeft(this._scaleY)
        .tickSize(0)
        .tickPadding(8);
      svg.append('text')
        .attr('class', 'axis-label')
        .attrs({
          x: this.unitsWidthAxis + this.unitsWidthBars / 2,
          y: this.unitsHeightBars + this.unitsHeightAxis - 16,
          dy: '.35em',
          'text-anchor': 'middle',
        })
        .text('Start Hour');
      svg.append('g')
        .attr('transform', `translate(16, ${this.unitsHeightBars / 2})`)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('class', 'axis-label')
        .attrs({
          dy: '.35em',
          'text-anchor': 'middle',
        })
        .text('Number of Vehicles');
    },
    onResize() {
      this.pixelsHeight = this.$el.clientHeight;
      this.pixelsWidth = this.$el.clientWidth;
    },
    updateChart() {
      this._scaleX
        .domain([...this.chartData.keys()]);
      this._scaleY
        .domain([0, max(this.chartData)]);

      const bars = this._groupBars.selectAll('rect.bar')
        .data(this.chartData);

      bars.exit().remove();

      bars.enter().append('rect')
        .attr('class', 'bar')
        .on('mouseenter', (_, h) => {
          this.internalValue = h;
        })
        .merge(bars)
        .classed('highlight', (_, h) => this.internalValue === h)
        .attrs((n, h) => {
          const x = this._scaleX(h);
          const y = this._scaleY(n);
          const width = this._scaleX.bandwidth();
          const height = this.unitsHeightBars - y;
          return {
            x,
            y,
            width,
            height,
          };
        });

      this._groupAxisX.call(this._axisX);
      this._groupAxisY.call(this._axisY);
    },
  },
};
</script>

<style lang="postcss">
.fc-chart-atr-volume-24h {
  & > svg {
    & rect.bar {
      fill: var(--base);
      &.highlight {
        fill: var(--primary-vivid);
      }
    }
    & .tick {
      font-size: var(--font-size-m);
    }
    & .axis-label {
      font-size: var(--font-size-l);
    }
  }
}
</style>
