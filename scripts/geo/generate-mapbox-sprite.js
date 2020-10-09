/* eslint-disable import/no-extraneous-dependencies */
const spritezero = require('@mapbox/spritezero');
const glob = require('glob');

const fs = require('fs');
const path = require('path');

const GIT_ROOT = path.resolve(path.join(__dirname, '..', '..'));
const DIR_ICONS = path.resolve(path.join(GIT_ROOT, 'public', 'icons', 'map'));

function getPixelRatioSuffix(pixelRatio) {
  if (pixelRatio === 1) {
    return '';
  }
  return `@${pixelRatio}x`;
}

[1, 2, 4].forEach((pixelRatio) => {
  const svgGlob = path.resolve(path.join(DIR_ICONS, '*.svg'));
  const svgPaths = glob.sync(svgGlob);
  const imgs = svgPaths.map((svgPath) => {
    const id = path.basename(svgPath).replace('.svg', '');
    const svg = fs.readFileSync(svgPath);
    return { id, svg };
  });

  const suffix = getPixelRatioSuffix(pixelRatio);
  const pngPath = path.resolve(path.join(DIR_ICONS, `sprite${suffix}.png`));
  const jsonPath = path.resolve(path.join(DIR_ICONS, `sprite${suffix}.json`));

  // Export JSON sprite layout map (`format: true`)
  spritezero.generateLayout({ imgs, pixelRatio, format: true }, (err, dataLayout) => {
    if (err) return;
    fs.writeFileSync(jsonPath, JSON.stringify(dataLayout));
  });

  // Export PNG sprite (`format: false`)
  spritezero.generateLayout({ imgs, pixelRatio, format: false }, (err, imageLayout) => {
    if (err) return;
    spritezero.generateImage(imageLayout, (err2, image) => {
      if (err2) return;
      fs.writeFileSync(pngPath, image);
    });
  });
});
