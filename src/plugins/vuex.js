import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default (vuexElectronDeps) => new Vuex.Store({
	plugins: [
		vuexElectronDeps.createPersistedState(),
		vuexElectronDeps.createSharedMutations()
	],
	state: {
		settings: {
			image: {
				saveFolder: null // set in background.js
			}
		},
		enableRandomCron: false,
		randomCronExpression: "*/1 * * * *",
		triangleVariance: 0.21,
		patternIntensity: 0.3,
		cellSize: 0.05,
		fill: true,
		strokeWidth: 0,
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
		fillSet(state, payload) {
			state.fill = payload;
		},
		strokeWidthSet(state, payload) {
			state.strokeWidth = payload;
		},
		selectedColorPalletSet(state, payload) {
			state.selectedColorPallet = payload;
		},
		enableRandomCronSet(state, payload) {
			state.enableRandomCron = payload;
		},
		randomCronExpressionSet(state, payload) {
			state.randomCronExpression = payload;
		},

		settingsImageSavePathSet(state, payload) {
			state.settings.image.savePath = payload;
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
		fill({ commit }, fill) {
			commit('fillSet', fill);
		},
		strokeWidth({ commit }, strokeWidth) {
			commit('strokeWidthSet', strokeWidth);
		},
		selectedColorPallet({ commit }, colorpalette) {
			commit('selectedColorPalletSet', colorpalette);
		},
		enableRandomCron({ commit }, enabled) {
			commit('enableRandomCronSet', enabled);
		},
		randomCronExpression({ commit }, expression) {
			commit('randomCronExpressionSet', expression);
		},

		settingsImageSavePath({ commit }, imageSavePath) {
			commit('settingsImageSavePathSet', imageSavePath);
		},
	}
});