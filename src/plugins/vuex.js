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
		randomCronWebhook: null,
		randomCronExpression: "*/1 * * * *",
		triangleVariance: 0.21,
		patternIntensity: 0.3,
		cellSize: 0.05,
		fill: true,
		strokeWidth: 0,
		selectedColorPallet: null,
		selectedCustomColorPalette: null,
		customColorPalettes: {},
		paletteTab: 0,
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
		selectedCustomColorPaletteSet(state, payload) {
			state.selectedCustomColorPalette = payload;
		},
		customColorPalettesSet(state, payload) {
			state.customColorPalettes = payload;
		},
		paletteTabSet(state, payload) {
			state.paletteTab = payload;
		},

		randomCronWebhookSet(state, payload) {
			state.randomCronWebhook = payload;
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
		selectedCustomColorPalette({ commit }, colorpalette) {
			commit('selectedCustomColorPaletteSet', colorpalette);
		},
		customColorPalettes({ commit }, colorpalettes) {
			commit('customColorPalettesSet', colorpalettes);
		},
		paletteTab({ commit }, tab) {
			commit('paletteTabSet', tab);
		},

		randomCronWebhook({ commit }, enabled) {
			commit('randomCronWebhookSet', enabled);
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