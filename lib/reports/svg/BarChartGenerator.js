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
      title: null,
      unitsHeightAxis: 64,
      unitsHeightTitle: 64,
      unitsWidthAxis: 80,
    };
    const {
      colorAxis,
      colorBars,
      labelAxisX,
      labelAxisY,
      title,
      unitsHeightAxis,
      unitsHeightTitle,
      unitsWidthAxis,
    } = Object.assign(defaultOptions, options);

    this.colorAxis = colorAxis;
    this.colorBars = colorBars;
    this.labelAxisX = labelAxisX;
    this.labelAxisY = labelAxisY;
    this.title = title;
    this.unitsWidthAxis = unitsWidthAxis;
    this.unitsHeightAxis = unitsHeightAxis;
    this.unitsHeightTitle = unitsHeightTitle;
    this.unitsWidthBars = this.unitsWidth - this.unitsWidthAxis;
    this.unitsHeightBars = this.unitsHeight - this.unitsHeightAxis - this.unitsHeightTitle;
  }

  init() {
    this.groupBars = this.svg.append('g')
      .attr('transform', `translate(${this.unitsWidthAxis}, ${this.unitsHeightTitle})`);
    const unitsHeightGraph = this.unitsHeightBars + this.unitsHeightTitle;
    this.groupAxisX = this.svg.append('g')
      .attr('transform', `translate(${this.unitsWidthAxis}, ${unitsHeightGraph})`)
      .attr('color', this.colorAxis === null ? undefined : this.colorAxis);
    this.groupAxisY = this.svg.append('g')
      .attr('transform', `translate(${this.unitsWidthAxis}, ${this.unitsHeightTitle})`)
      .attr('color', this.colorAxis === null ? undefined : this.colorAxis);
    this.scaleX = scaleBand()
      .range([0, this.unitsWidthBars])
      .padding(0.1);
    this.scaleY = scaleLinear()
      .range([this.unitsHeightBars, 0]);
    this.axisX = axisBottom(this.scaleX)
      .tickSize(0)
      .tickPadding(8)
      .tickFormat(i => this.data[i].tick);
    this.axisY = axisLeft(this.scaleY)
      .tickSize(0)
      .tickPadding(8);
    if (this.title !== null) {
      this.svg.append('text')
        .attr('class', 'display-2')
        .attrs({
          x: this.unitsWidth / 2,
          y: 0,
          dy: '1em',
          'text-anchor': 'middle',
        })
        .text(this.title);
    }
    this.svg.append('text')
      .attr('class', 'display-1')
      .attrs({
        x: this.unitsWidthAxis + this.unitsWidthBars / 2,
        y: this.unitsHeightTitle + this.unitsHeightBars + this.unitsHeightAxis - 16,
        dy: '.35em',
        'text-anchor': 'middle',
      })
      .text(this.labelAxisX);
    this.svg.append('g')
      .attr('transform', `translate(16, ${this.unitsHeightTitle + this.unitsHeightBars / 2})`)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('class', 'display-1')
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
      .domain([0, max(this.data.map(({ value }) => value))]);

    const bars = this.groupBars.selectAll('rect.bar')
      .data(this.data);

    bars.exit().remove();

    bars.enter().append('rect')
      .attr('class', 'bar')
      .style('fill', this.colorBars === null ? undefined : this.colorBars)
      .merge(bars)
      .attrs((d, i) => {
        const x = this.scaleX(i);
        const y = this.scaleY(d.value);
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
