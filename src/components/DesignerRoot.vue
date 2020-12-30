<template>
  <v-row class="mb-6 mr-1 ml-1">
    <v-col cols="12" md="4" order="2" order-md="1">
      <!-- wallpaper NPM package only lets us a pick a screen on mac. So for now, were forcing main only. -->
      <!-- <v-list dense>
          <v-subheader>Screens</v-subheader>
          <v-list-item-group
            v-model="selectedScreenId"
            color="primary"
          >
            <v-list-item
              v-for="screen in screens"
              :key="screen.id"
              :value="screen.id"
            >
              <v-list-item-content>
                <v-list-item-title v-show="screen.isPrimary" class="text-uppercase">primary display</v-list-item-title>
                <v-list-item-subtitle>W{{screen.size.width}} x H{{screen.size.height}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list> -->

      <v-expansion-panels accordion v-model="customizationPanel">
        <v-expansion-panel>
          <v-expansion-panel-header ripple>Customize</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model="selectedScreenHeight"
                  label="Height"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="selectedScreenWidth"
                  label="Width"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-btn tile class="" block @click="resetSelectedMonitorHeightWidth" text>
                  Reset
                </v-btn>
              </v-col>
            </v-row>

            <v-slider
              label="Pattern Intensity"
              v-model="patternIntensity"
              max="1"
              min="0"
              step="0.01"
            ></v-slider>

            <v-slider
              label="Triangle Variance"
              v-model="triangleVariance"
              max="1"
              min="0"
              step="0.01"
            ></v-slider>

            <v-slider
              label="Cell Size"
              v-model="cellSize"
              max=".25"
              min=".02"
              step="0.01"
            ></v-slider>

            <v-checkbox label="Fill" v-model="fill" />

            <v-text-field
              label="Stroke Width"
              v-model="strokeWidth"
              v-if="!fill"
            />

            <v-btn tile class="mb-6" block @click="randomize">
              <v-icon>mdi-shuffle-variant</v-icon>
            </v-btn>

            <v-tabs grow v-model="paletteTab">
              <v-tab>
                Preset Palette
              </v-tab>
              <v-tab>
                Custom Palette
              </v-tab>
              <v-tabs-items v-model="paletteTab">
                <v-tab-item>
                  <v-list
                    dense
                    style="max-height: 600px"
                    class="overflow-y-auto mt-2"
                  >
                    <v-list-item-group v-model="selectedColorPallet">
                      <v-list-item
                        v-for="(palette, index) in palettes"
                        :key="index"
                        :value="index"
                      >
                        <v-list-item-content>
                          <Palette v-bind:colors="palette" />
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-tab-item>
                <v-tab-item class="mt-2">

                  <custom-palette-designer @save="saveCustomPalette" />

                  <v-list
                    dense
                    style="max-height: 600px"
                    class="overflow-y-auto mt-2"
                  >
                    <v-list-item-group v-model="selectedCustomColorPalette">
                      <v-list-item
                        v-for="(palette, index) in customPalettes"
                        :key="index"
                        :value="index"
                      >
                        <v-list-item-content>
                          <v-card class="d-flex" flat tile elevation="0">
                            <v-btn icon tile small @click="removeCustomColor(palette, index)"
                              ><v-icon>mdi-delete</v-icon></v-btn
                            >
                            <Palette v-bind:colors="palette" :selectable="true" />
                          </v-card>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-tab-item>
              </v-tabs-items>
            </v-tabs>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>

    <v-col cols="12" md="8" order="1" order-md="2">
      <canvas id="mainDesignerCanvas" height="900" width="1440" />
      <canvas id="randomCronCanvas" style="display: none;" />
      <v-row justify="center" align="center" class="mt-6">
        <v-btn v-on:click="saveAndSet" color="success" tile x-large
          >Set as Wallpaper</v-btn
        >
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              v-on:click="save"
              color="primary"
              tile
              v-bind="attrs"
              v-on="on"
              x-large
              >Save Wallpaper</v-btn
            >
          </template>
          <span>{{ savePathTooltip }}</span>
        </v-tooltip>
      </v-row>
    </v-col>
  </v-row>
</template>
<style scoped>
#mainDesignerCanvas {
  max-height: 100%;
  max-width: 100%;
  flex: 1 1 auto;
  height: auto;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(2px 2px 8px rgba(0, 0, 0, 0.2));
}
</style>
<script>
import trianglify from "@victorioberra/trianglify-browser";
import Palette from "./Palette";
import CustomPaletteDesigner from "./CustomPaletteDesigner";
import colorbrewer from "../colorbrewer";

import memoizeOne from "memoize-one";
import { v4 as uuidv4 } from 'uuid';
// import { mapState, mapActions } from 'vuex'

let memoizedInterpolateLinearColorFunction = memoizeOne(
  trianglify.colorFunctions.interpolateLinear
);

import _ from "lodash";

export default {
  name: "DesignerRoot",
  components: {
    Palette,
    CustomPaletteDesigner,
  },
  data: () => ({
    customizationPanel: 0,
    screens: [],
    palettes: colorbrewer,
    wallpaper: null,

    selectedScreenId: null,
    selectedScreen: null,
  }),
  computed: {
    savePathTooltip() {
      return `Saving to: '${this.$store.state.settings.image.savePath}'. Change in settings.`;
    },
    triangleVariance: {
      get() {
        return this.$store.state.triangleVariance;
      },
      async set(value) {
        await this.$store.dispatch("triangleVariance", value);
      },
    },
    patternIntensity: {
      get() {
        return this.$store.state.patternIntensity;
      },
      async set(value) {
        await this.$store.dispatch("patternIntensity", value);
      },
    },
    cellSize: {
      get() {
        return this.$store.state.cellSize;
      },
      async set(value) {
        await this.$store.dispatch("cellSize", value);
      },
    },
    selectedScreenHeight: {
      get() {
        return this.$store.state.selectedScreenHeight;
      },
      async set(value) {
        await this.$store.dispatch("selectedScreenHeight", value);
      },
    },
    selectedScreenWidth: {
      get() {
        return this.$store.state.selectedScreenWidth;
      },
      async set(value) {
        await this.$store.dispatch("selectedScreenWidth", value);
      },
    },
    fill: {
      get() {
        return this.$store.state.fill;
      },
      async set(value) {
        await this.$store.dispatch("fill", value);
      },
    },
    strokeWidth: {
      get() {
        return this.$store.state.strokeWidth;
      },
      async set(value) {
        await this.$store.dispatch("strokeWidth", value);
      },
    },
    selectedColorPallet: {
      get() {
        return this.$store.state.selectedColorPallet;
      },
      async set(value) {
        await this.$store.dispatch("selectedColorPallet", value);
      },
    },
    selectedCustomColorPalette: {
      get() {
        return this.$store.state.selectedCustomColorPalette;
      },
      async set(value) {
        await this.$store.dispatch("selectedCustomColorPalette", value);
      },
    },
    customPalettes: {
      get() {
        return this.$store.state.customColorPalettes;
      },
      async set(value) {
        await this.$store.dispatch("customColorPalettes", value);
      },
    },
    paletteTab: {
      get() {
        return this.$store.state.paletteTab;
      },
      async set(value) {
        await this.$store.dispatch("paletteTab", value);
      },
    },
  },
  watch: {
    selectedScreenId: function(val) {
      let selectedScreen = this.screens.find((x) => x.id == val);
      this.selectedScreen = selectedScreen;
    },
    selectedScreenWidth: function() {
      this.generateTrianglifyCanvas();
    },
    selectedScreenHeight: function() {
      this.generateTrianglifyCanvas();
    },
    patternIntensity: function() {
      window.log.warn("Watcher for patternIntensity!");
      this.generateTrianglifyCanvas();
    },
    triangleVariance: function() {
      this.generateTrianglifyCanvas();
    },
    cellSize: function() {
      this.generateTrianglifyCanvas();
    },
    fill: function() {
      this.generateTrianglifyCanvas();
    },
    strokeWidth: function() {
      this.generateTrianglifyCanvas();
    },
    selectedColorPallet: function(newValue, oldValue) {
      // Prevent unselecting, it seems like confusing UX
      if (newValue === undefined) {
        this.selectedColorPallet = oldValue;
      }
      this.generateTrianglifyCanvas();
    },
    selectedCustomColorPalette: function(newValue, oldValue) {
      // Prevent unselecting, it seems like confusing UX
      if (newValue === undefined) {
        this.selectedCustomColorPalette = oldValue;
      }
      this.generateTrianglifyCanvas();
    },
  },
  methods: {
    randomize() {
      let trianglifyOptions = randomizeTrianglifyOptions();
      this.selectedColorPallet = null;
      this.selecteCustomColorPallet = null;
      this.patternIntensity = trianglifyOptions.patternIntensity;
      this.triangleVariance = trianglifyOptions.triangleVariance;
      this.cellSize = trianglifyOptions.cellSize;
      this.generateTrianglifyCanvas();
    },
    wallpaperSetEventHandler(event, err) {
      // Currently err is not passed to this.
      // TODO: Toggle button loading?
      if (err) {
        this.$toast.error(err);
      } else {
        this.$toast.success("Wallpaper set!");
      }
    },
    wallpaperSaveEventHandler(event, err) {
      // Currently err is not passed to this.
      // TODO: Toggle button loading?
      if (err) {
        this.$toast.error(err);
      } else {
        this.$toast.success(`Wallpaper saved to ${this.savePathTooltip}!`);
      }
    },
    cronSetWallpaperCommandWebhookHandler() {
      window.log.error(arguments);
    },
    cronSetWallpaperCommandHandler() {
      window.log.info("DesignerRoot handling random wallpaper set request.");

      // var combinedPalettes = _.assign(
      //   {},
      //   JSON.parse(JSON.stringify(this.palettes)),
      //   JSON.parse(JSON.stringify(this.customPalettes))
      // );

      let opts = {
        palette: this.palettes,
        width: this.selectedScreenWidth,
        height: this.selectedScreenHeight,
        cellSize:
          Math.max(this.selectedScreenWidth, this.selectedScreenHeight) *
          this.cellSize,
        variance: this.triangleVariance,
        xColors: "random",
        fill: this.fill,
        strokeWidth: this.strokeWidth,
        colorFunction: memoizedInterpolateLinearColorFunction(
          this.patternIntensity
        ),
      };

      const pattern = trianglify(opts);
      const canvas = pattern.toCanvas(this.randomCronCanvas, {
        applyCssScaling: false, // don't try to apply scaling with CSS
      });

      window.ipcRenderer.send("set-wallpaper-message", canvas.toDataURL());

      this.$toast.success("Wallpaper set!");
    },
    saveAndSet: async function() {
      window.ipcRenderer.send("set-wallpaper-message", this.wallpaper);
    },
    save: async function() {
      window.ipcRenderer.send("save-wallpaper-message", this.wallpaper);
    },
    async saveCustomPalette(palette) {
      const newColorPaletteKey = uuidv4();
      this.$set(this.customPalettes, newColorPaletteKey, palette)
      this.selectedCustomColorPalette = newColorPaletteKey;
      await this.$store.dispatch("customColorPalettes", this.customPalettes);
    },
    async removeCustomColor(palette, index) {
      return this.$confirm('Do you really want to remove this custom palette?').then((res) => {
        if(res) {
          if(Object.keys(this.customPalettes).length > 0) {
            this.selectedCustomColorPalette = Object.keys(this.customPalettes)[0];
          }
          this.$delete(this.customPalettes, index)
        }
      })
    },
    resetSelectedMonitorHeightWidth() {
        // Just set to primary for now.
        let selectedScreen = this.screens.find((x) => x.isPrimary);
        this.selectedScreenHeight = selectedScreen.size.height;
        this.selectedScreenWidth = selectedScreen.size.width;
    }
  },
  mounted() {
    // TODO: consistency
    window.ipcRenderer.on("set-wallpaper-reply", this.wallpaperSetEventHandler);
    window.ipcRenderer.on(
      "save-wallpaper-reply",
      this.wallpaperSaveEventHandler
    );
    window.cronSetWallpaperCommand(this.cronSetWallpaperCommandHandler);
    window.cronSetWallpaperCommandWebhook(
      this.cronSetWallpaperCommandWebhookHandler
    );
    this.mainDesignerCanvas = document.getElementById("mainDesignerCanvas");
    this.randomCronCanvas = document.getElementById("randomCronCanvas");
  },
  destroyed() {
    window.ipcRenderer.removeListener(
      "set-wallpaper-reply",
      this.wallpaperSetEventHandler
    );
    window.ipcRenderer.removeListener(
      "save-wallpaper-reply",
      this.wallpaperSaveEventHandler
    );
    window.cronSetWallpaperCommandRemove(this.cronSetWallpaperCommandHandler);
    window.cronSetWallpaperCommandWebhookRemove(
      this.cronSetWallpaperCommandWebhookHandler
    );
  },
  created: function() {
    this.tempPath = window.ipcRenderer.sendSync("get-path-message", "temp");
    const screens = window.ipcRenderer.sendSync("get-screens-message");

    // Set an initial color selection
    if (this.selectedColorPallet === null) {
      this.selectedColorPallet = Object.keys(this.palettes)[10];
    }

    this.screens = screens.all.map(function(screen) {
      return {
        size: screen.size,
        id: screen.id,
        isPrimary: screen.id === screens.primary.id,
      };
    });

    let selectedScreen = this.screens.find((x) => x.isPrimary);
    this.selectedScreenId = selectedScreen.id;

    // Initial set of width and height
    if(!this.selectedScreenHeight) {
      this.selectedScreenHeight = selectedScreen.size.height;
    }
    if(!this.selectedScreenWidth) {
      this.selectedScreenWidth = selectedScreen.size.width;
    }

    let combinedPalettes = _.assign(
      {},
      JSON.parse(JSON.stringify(this.palettes)),
      JSON.parse(JSON.stringify(this.customPalettes))
    );

    console.log(combinedPalettes);

    // https://stackoverflow.com/a/49780382/1777780
    this.generateTrianglifyCanvas = _.debounce(() => {
      let opts = {
        palette: combinedPalettes,
        width: this.selectedScreenWidth,
        height: this.selectedScreenHeight,
        cellSize:
          Math.max(this.selectedScreenWidth, this.selectedScreenHeight) *
          this.cellSize,
        variance: this.triangleVariance,
        xColors: "random",
        fill: this.fill,
        strokeWidth: this.strokeWidth,
        colorFunction: memoizedInterpolateLinearColorFunction(
          this.patternIntensity
        ),
      };

      if(this.paletteTab === 0) {
        if (this.selectedColorPallet !== null && this.selectedColorPallet) {
          opts.xColors = this.palettes[this.selectedColorPallet];
        }
      }

      if(this.paletteTab === 1) {
        if (this.selectedCustomColorPalette !== null && this.selectedCustomColorPalette) {
          opts.xColors = this.customPalettes[this.selectedCustomColorPalette];
        }
      }

      const pattern = trianglify(opts);
      const canvas = pattern.toCanvas(this.mainDesignerCanvas, {
        applyCssScaling: false, // don't try to apply scaling with CSS
      });

      this.wallpaper = canvas.toDataURL();
    }, 1000 / 15);

    this.generateTrianglifyCanvas();
  },
};

function randomizeTrianglifyOptions() {
  return {
    patternIntensity: _.random(0.01, 1.0),
    triangleVariance: _.random(0.01, 1.0),
    cellSize: _.random(0.02, 0.25),
  };
}
</script>
