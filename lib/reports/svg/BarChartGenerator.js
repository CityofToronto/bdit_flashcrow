/* eslint-disable indent */
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { scaleBand, scaleLinear } from 'd3-scale';
import 'd3-selection-multi';

import SvgGenerator from '@/lib/reports/svg/SvgGenerator';

class BarChartGenerator extends SvgGenerator {
  constructor(container, options) {
    super(container, options);

    const defaultOptions = {
      colorAxis: null,
      colorBars: null,
      labelAxisX: null,
      labelAxisY: null,
      unitsHeightAxis: 64,
      // unitsHeightTitle: 64,
      unitsWidthAxis: 80,
      // title: null,
    };
    const {
      colorAxis,
      colorBars,
      labelAxisX,
      labelAxisY,
      unitsHeightAxis,
      unitsWidthAxis,
    } = Object.assign(defaultOptions, options);

    this.colorAxis = colorAxis;
    this.colorBars = colorBars;
    this.labelAxisX = labelAxisX;
    this.labelAxisY = labelAxisY;
    this.unitsWidthAxis = unitsWidthAxis;
    this.unitsHeightAxis = unitsHeightAxis;
    this.unitsWidthBars = this.unitsWidth - this.unitsWidthAxis;
    this.unitsHeightBars = this.unitsHeight - this.unitsHeightAxis;
  }

  init() {
    this.groupBars = this.svg.append('g')
      .attr('transform', `translate(${this.unitsWidthAxis}, 0)`)
      .on('mouseleave', () => {
        this.internalValue = null;
      });
    this.groupAxisX = this.svg.append('g')
      .attr('transform', `translate(${this.unitsWidthAxis}, ${this.unitsHeightBars})`)
      .attr('color', this.colorAxis === null ? undefined : this.colorAxis);
    this.groupAxisY = this.svg.append('g')
      .attr('transform', `translate(${this.unitsWidthAxis}, 0)`)
      .attr('color', this.colorAxis === null ? undefined : this.colorAxis);
    this.scaleX = scaleBand()
      .range([0, this.unitsWidthBars])
      .padding(0.1);
    this.scaleY = scaleLinear()
      .range([this.unitsHeightBars, 0]);
    this.axisX = axisBottom(this.scaleX)
      .tickSize(0)
      .tickPadding(8);
    this.axisY = axisLeft(this.scaleY)
      .tickSize(0)
      .tickPadding(8);
    this.svg.append('text')
      .attr('class', 'axis-label')
      .attrs({
        x: this.unitsWidthAxis + this.unitsWidthBars / 2,
        y: this.unitsHeightBars + this.unitsHeightAxis - 16,
        dy: '.35em',
        'text-anchor': 'middle',
      })
      .text(this.labelAxisX);
    this.svg.append('g')
      .attr('transform', `translate(16, ${this.unitsHeightBars / 2})`)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('class', 'axis-label')
      .attrs({
        dy: '.35em',
        'text-anchor': 'middle',
      })
      .text(this.labelAxisY);
  }

  update() {
    this.scaleX
      .domain([...this.data.keys()]);
    this.scaleY
      .domain([0, max(this.data)]);

    const bars = this.groupBars.selectAll('rect.bar')
      .data(this.data);

    bars.exit().remove();

    bars.enter().append('rect')
      .attr('class', 'bar')
      .style('fill', this.colorBars === null ? undefined : this.colorBars)
      .on('mouseenter', (_, h) => {
        this.internalValue = h;
      })
      .merge(bars)
      .classed('highlight', (_, h) => this.internalValue === h)
      .attrs((n, h) => {
        const x = this.scaleX(h);
        const y = this.scaleY(n);
        const width = this.scaleX.bandwidth();
        const height = this.unitsHeightBars - y;
        return {
          x,
          y,
          width,
          height,
        };
      });

    this.groupAxisX.call(this.axisX);
    this.groupAxisY.call(this.axisY);
  }
}

export default BarChartGenerator;
