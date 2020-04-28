import SvgGenerator from '@/lib/reports/svg/SvgGenerator';
import SvgStringRenderer from '@/lib/reports/svg/SvgStringRenderer';
import 'd3-selection-multi';

class NoopSvgGenerator extends SvgGenerator {
  /* eslint-disable-next-line class-methods-use-this */
  init() {}

  /* eslint-disable-next-line class-methods-use-this */
  update() {}
}

class SimpleSvgGenerator extends SvgGenerator {
  constructor(container, options) {
    super(container, options);
    this.i = 0;
  }

  init() {
    this.group = this.svg.append('g');
  }

  update() {
    this.data[this.i] += 1;
    this.i = (this.i + 1) % this.data.length;

    const text = this.group.selectAll('text.foo')
      .data(this.data);

    text.exit().remove();

    text.enter().append('text')
      .attr('class', 'foo')
      .merge(text)
      .text(d => d);
  }
}

test('SvgStringRenderer.render', () => {
  expect(SvgStringRenderer.render(NoopSvgGenerator, {
    aspectRatio: 2,
    width: 640,
    height: 320,
  })).toEqual(
    '<svg width="640" height="320" viewBox="0 0 960 480" xmlns="http://www.w3.org/2000/svg"></svg>',
  );
  expect(SvgStringRenderer.render(SimpleSvgGenerator, {
    data: [0, 0, 0],
    width: 800,
    height: 450,
  })).toEqual(
    '<svg width="800" height="450" viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg"><g><text class="foo">1</text><text class="foo">0</text><text class="foo">0</text></g></svg>',
  );
});
