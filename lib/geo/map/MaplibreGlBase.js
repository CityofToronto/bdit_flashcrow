import maplibregl from 'maplibre-gl/dist/maplibre-gl';

import { MapZoom } from '@/lib/Constants';

const BOUNDS_TORONTO = new maplibregl.LngLatBounds(
  new maplibregl.LngLat(-79.649264937, 43.570995995),
  new maplibregl.LngLat(-79.105243191, 43.865457183),
);

function makeMaplibreGlMap($el, mapStyle) {
  const bounds = BOUNDS_TORONTO;
  const map = new maplibregl.Map({
    bounds,
    boxZoom: false,
    container: $el,
    dragRotate: false,
    maxBounds: bounds,
    minZoom: MapZoom.MIN,
    maxZoom: MapZoom.MAX,
    pitchWithRotate: false,
    renderWorldCopies: false,
    style: mapStyle,
    zoom: MapZoom.MIN,
  });
  map.addControl(
    new maplibregl.AttributionControl({
      customAttribution: [
        '<span role="listitem"><a href="https://docs.mapbox.com/mapbox-gl-js/overview/">Mapbox GL</a></span>',
        '<span role="listitem">Powered by <a href="https://www.esri.com/">Esri</a></span>',
      ],
    }),
    'bottom-left',
  );
  map.addControl(
    new maplibregl.ScaleControl({ maxWidth: 128, unit: 'metric' }),
    'bottom-left',
  );
  map.addControl(
    new maplibregl.NavigationControl({ showCompass: false }),
    'bottom-right',
  );
  return map;
}

/**
 * @namespace
 */
const MaplibreGlBase = {
  BOUNDS_TORONTO,
  makeMaplibreGlMap,
};

export {
  MaplibreGlBase as default,
  BOUNDS_TORONTO,
  makeMaplibreGlMap,
};
