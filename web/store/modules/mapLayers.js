import {
  LegendMode,
} from '@/lib/Constants';

export default {
  namespaced: true,
  state: {
    layers: {
      collisions: true,
      hospitals: true,
      schools: true,
      studies: true,
      volume: false,
    },
    layersFocusLocations: {
      collisions: false,
      hospitals: true,
      schools: true,
      studies: true,
      volume: false,
    },
    legendMode: LegendMode.NORMAL,
  },
  getters: {
    layersForMode(state) {
      if (state.legendMode === LegendMode.FOCUS_LOCATIONS) {
        return state.layersFocusLocations;
      }
      return state.layers;
    },
  },
  mutations: {
    setLegendMode(state, legendMode) {
      state.legendMode = legendMode;
      if (legendMode === LegendMode.FOCUS_LOCATIONS) {
        const { layers } = state;
        const layersFocusLocations = {
          ...layers,
          collisions: false,
        };
        state.layersFocusLocations = layersFocusLocations;
      }
    },
    setLayers(state, layers) {
      if (state.legendMode === LegendMode.FOCUS_LOCATIONS) {
        state.layersFocusLocations = layers;
      } else {
        state.layers = layers;
      }
    },
  },
};
