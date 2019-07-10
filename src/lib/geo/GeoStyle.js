/**
 * Normalizes map styles from ArcGIS / ESRI into the Mapbox GL Style Specification format.
 * These styles are loaded into `bdit_flashcrow` via `scripts/geo/fetch-esri-style.sh`,
 * along with the associated metadata.  Both style and metadata can then be passed into
 * `new GeoStyle()` to build a `mapbox-gl`-compatible style object.
 *
 * @see https://docs.mapbox.com/mapbox-gl-js/style-spec/
 * @see http://bl.ocks.org/jgravois/51e2b30e3d6cf6c00f06b263a29108a2
 * @param {object} style - ArcGIS / ESRI map style
 * @param {object} metadata - ArcGIS / ESRI map style metadata
 */
class GeoStyle {
  constructor(style, metadata) {
    this.style = style;
    this.style.sources.esri = {
      type: 'vector',
      scheme: 'xyz',
      tilejson: metadata.tilejson || '2.0.0',
      format: (metadata.tileInfo && metadata.tileInfo.format) || 'pbf',
      maxzoom: 15,
      tiles: [
        `${style.sources.esri.url}${metadata.tiles[0]}`,
      ],
      description: metadata.description || '',
      name: metadata.name,
    };
  }

  /**
   * Get a deep copy of `this.style`, so that you can further mutate it without
   * affecting the style on which it's based.
   *
   * @returns a deep copy of `this.style`
   */
  get() {
    return JSON.parse(JSON.stringify(this.style));
  }
}

export default GeoStyle;
