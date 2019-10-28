import { select } from 'd3-selection';
import { JSDOM } from 'jsdom';

class SvgStringRenderer {
  static render(GeneratorClass, options) {
    const fakeDom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    const container = select(fakeDom.window.document.body);
    const generator = new GeneratorClass(container, options);
    generator.init();
    generator.update();
    return container.html();
  }
}

export default SvgStringRenderer;
