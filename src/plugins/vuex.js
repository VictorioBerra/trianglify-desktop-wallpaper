import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default (vuexElectronDeps) => new Vuex.Store({
	plugins: [
		vuexElectronDeps.createPersistedState(),
		vuexElectronDeps.createSharedMutations()
	],
	state: {
		triangleVariance: 0.21,
		patternIntensity: 0.3,
		cellSize: 0.05,
		selectedColorPallet: null,
	},
	mutations: {
		triangleVarianceSet(state, payload) {
			state.triangleVariance = payload;
		},
		patternIntensitySet(state, payload) {
			state.patternIntensity = payload;
		},
		cellSizeSet(state, payload) {
			state.cellSize = payload;
		},
		selectedColorPalletSet(state, payload) {
			state.selectedColorPallet = payload;
		},
	},
	actions: {
		triangleVariance({ commit }, variance) {
			commit('triangleVarianceSet', variance);
		},
		patternIntensity({ commit }, intensity) {
			commit('patternIntensitySet', intensity);
		},
		cellSize({ commit }, cellSize) {
			commit('cellSizeSet', cellSize);
		},
		selectedColorPallet({ commit }, colorpalette) {
			commit('selectedColorPalletSet', colorpalette);
		},
	}
});