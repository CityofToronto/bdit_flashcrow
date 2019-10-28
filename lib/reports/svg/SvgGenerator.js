/* eslint-disable indent */
import { NotImplementedError } from '@/lib/error/MoveErrors';

/**
 * Common superclass for modules that generate SVG charts.  These are intended to
 * be usable in both frontend and backend.
 */
class SvgGenerator {
  constructor(container, {
    aspectRatio = SvgGenerator.DEFAULT_ASPECT_RATIO,
    data,
    height,
    width,
  }) {
    this.data = data;

    this.pixelsWidth = width;
    this.pixelsHeight = height;

    this.unitsWidth = SvgGenerator.WIDTH_UNITS;
    this.unitsHeight = SvgGenerator.WIDTH_UNITS / aspectRatio;

    this.svg = container
      .append('svg')
        .attr('width', this.pixelsWidth)
        .attr('height', this.pixelsHeight)
        .attr('viewBox', `0 0 ${this.unitsWidth} ${this.unitsHeight}`)
        .attr('xmlns', 'http://www.w3.org/2000/svg');
  }

  /* eslint-disable class-methods-use-this, no-unused-vars */
  init() {
    throw new NotImplementedError();
  }

  /* eslint-disable class-methods-use-this, no-unused-vars */
  update() {
    throw new NotImplementedError();
  }
}

/**
 * @type {number}
 */
SvgGenerator.DEFAULT_ASPECT_RATIO = 16 / 9;

/**
 * @type {number}
 */
SvgGenerator.WIDTH_UNITS = 960;

export default SvgGenerator;
