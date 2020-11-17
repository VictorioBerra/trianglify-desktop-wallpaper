<template>
  <v-container fluid>
    <v-row class="mb-6 mr-1 ml-1" justify="center" align="center">

      <v-col cols="4">
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
            <v-expansion-panel-header ripple
              >Customize</v-expansion-panel-header
            >
            <v-expansion-panel-content>
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="selectedScreenHeight"
                    label="Height"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="selectedScreenWidth"
                    label="Width"
                  ></v-text-field>
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

              <v-btn tile flat class="mb-6" block @click="randomize">
                <v-icon>mdi-shuffle-variant</v-icon>
              </v-btn>

              <v-list dense style="max-height: 600px" class="overflow-y-auto">
                <v-subheader>Palettes</v-subheader>
                <v-list-item-group
                  v-model="selectedColorPallet"
                >
                  <v-list-item v-for="(palette, name) in palettes" :key="name" :value="name">
                    <v-list-item-content>
                      <Palette v-bind:colors="palette" />
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-group>
              </v-list>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>

      <v-col cols="8">
        <canvas id="c" height="900" width="1440" />
        <v-row justify="center" align="center" class="mt-6">
          <!-- <v-btn
            v-on:click="generateTrianglifyCanvas"
            color="primary"
            tile
            x-large
            >Generate</v-btn
          > -->
          <v-btn v-on:click="save" color="success"             tile
            x-large>Set as Wallpaper</v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<style scoped>
#c {
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
import trianglify from "trianglify";
import Palette from "./Palette";
import colorbrewer from "../colorbrewer";
import _ from "lodash";

export default {
  components: {
    Palette,
  },
  data: () => ({
    customizationPanel: 0,
    screens: [],
    palettes: colorbrewer,
    wallpaper: null,

    selectedColorPallet: null, // Object.keys(colorbrewer)[0] defaulting to random for now.

    selectedScreenId: null,
    selectedScreen: null,
    selectedScreenHeight: null,
    selectedScreenWidth: null,

    triangleVariance: 0.21,
    patternIntensity: 0.3,
    cellSize: 0.05,
  }),
  watch: {
    selectedScreenId: function(val) {
      let selectedScreen = this.screens.find((x) => x.id == val);
      this.selectedScreen = selectedScreen;
      this.selectedScreenHeight = selectedScreen.size.height;
      this.selectedScreenWidth = selectedScreen.size.width;
    },
    selectedScreenWidth: function() {
      this.generateTrianglifyCanvas();
    },
    selectedScreenHeight: function() {
      this.generateTrianglifyCanvas();
    },
    patternIntensity: function() {
      this.generateTrianglifyCanvas();
    },
    triangleVariance: function() {
      this.generateTrianglifyCanvas();
    },
    cellSize: function() {
      this.generateTrianglifyCanvas();
    },
    selectedColorPallet: function() {
      this.generateTrianglifyCanvas();
    },
  },
  methods: {
    randomize () {
      this.selectedColorPallet = null;
      this.patternIntensity = _.random(0.01, 1.0)
      this.triangleVariance = _.random(0.01, 1.0)
      this.cellSize = _.random(.02, .25)
      this.generateTrianglifyCanvas()
    },
    wallpaperSetEventHandler(event, err) {
      if (err) {
        this.$toast.error(err);
      } else {
        this.$toast.success("Wallpaper set!");
      }
    },
    save: async function() {
      window.ipcRenderer.send("set-wallpaper-message", this.wallpaper);
    },
  },
  name: "Trianglify",
  mounted() {
    window.ipcRenderer.on("set-wallpaper-reply", this.wallpaperSetEventHandler);
    // How to unmount this?
    var c = document.getElementById("c");
    var ctx = c.getContext("2d");
    this.vueCanvas = c;
    this.vueCanvasContext = ctx;
  },
  destroyed() {
    window.ipcRenderer.removeListener(
      "set-wallpaper-reply",
      this.wallpaperSetEventHandler
    );
  },
  created: function() {
    this.tempPath = window.ipcRenderer.sendSync("get-path-message", "temp");
    const screens = window.ipcRenderer.sendSync("get-screens-message");

    this.screens = screens.all.map(function(screen) {
      return {
        size: screen.size,
        id: screen.id,
        isPrimary: screen.id === screens.primary.id,
      };
    });

    let selectedScreen = this.screens.find((x) => x.isPrimary);
    this.selectedScreenId = selectedScreen.id;

    // https://stackoverflow.com/a/49780382/1777780
    this.generateTrianglifyCanvas = _.debounce(() => {

      let opts = {
        palette: this.palettes,
        width: this.selectedScreenWidth,
        height: this.selectedScreenHeight,
        cellSize:
          Math.max(this.selectedScreenWidth, this.selectedScreenHeight) *
          this.cellSize,
        variance: this.triangleVariance,
        xColors: 'random',
        colorFunction: _.memoize(trianglify.colorFunctions.interpolateLinear(this.patternIntensity))
      };

      if(this.selectedColorPallet !== null && this.selectedColorPallet) {
        opts.xColors = this.palettes[this.selectedColorPallet];
      }

      console.log(opts);

      const pattern = trianglify(opts);
      const canvas = pattern.toCanvas(this.vueCanvas, {
        applyCssScaling: false,
      });

      this.wallpaper = canvas.toDataURL();
    }, 1000 / 15);

    this.generateTrianglifyCanvas();
  }
};
</script>
