<template>
<v-row class="mb-6 mr-1 ml-1" justify="center">

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

              <v-checkbox label="Fill" v-model="fill" />

              <v-text-field label="Stroke Width" v-model="strokeWidth" v-if="!fill" />

              <v-btn tile class="mb-6" block @click="randomize">
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
        <canvas id="mainDesignerCanvas" height="900" width="1440" />
        <canvas id="randomCronCanvas" style="display: none;"/>
        <v-row justify="center" align="center" class="mt-6">
          <v-btn v-on:click="save" color="success"             tile
            x-large>Set as Wallpaper</v-btn>
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
import trianglify from "trianglify";
import Palette from "./Palette";
import colorbrewer from "../colorbrewer";
import memoizeOne from 'memoize-one';
// import { mapState, mapActions } from 'vuex'

let memoizedInterpolateLinearColorFunction = memoizeOne(trianglify.colorFunctions.interpolateLinear)

import _ from "lodash";

export default {
  name: "DesignerRoot",
  components: {
    Palette,
  },
  data: () => ({
    customizationPanel: 0,
    screens: [],
    palettes: colorbrewer,
    wallpaper: null,

    selectedScreenId: null,
    selectedScreen: null,
    selectedScreenHeight: null,
    selectedScreenWidth: null,
  }),
  computed: {
    triangleVariance: {
      get () {
        return this.$store.state.triangleVariance
      },
      async set (value) {
        await this.$store.dispatch('triangleVariance', value)
      }
    },
    patternIntensity: {
      get () {
        return this.$store.state.patternIntensity
      },
      async set (value) {
        await this.$store.dispatch('patternIntensity', value)
      }
    },
    cellSize: {
      get () {
        return this.$store.state.cellSize
      },
      async set (value) {
        await this.$store.dispatch('cellSize', value)
      }
    },
    fill: {
      get () {
        return this.$store.state.fill
      },
      async set (value) {
        await this.$store.dispatch('fill', value)
      }
    },
    strokeWidth: {
      get () {
        return this.$store.state.strokeWidth
      },
      async set (value) {
        await this.$store.dispatch('strokeWidth', value)
      }
    },
    selectedColorPallet: {
      get () {
        return this.$store.state.selectedColorPallet
      },
      async set (value) {
        await this.$store.dispatch('selectedColorPallet', value)
      }
    },
  },
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
      window.log.warn("Watcher for patternIntensity!")
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
    selectedColorPallet: function() {
      this.generateTrianglifyCanvas();
    },
  },
  methods: {
    randomize () {
      let trianglifyOptions = randomizeTrianglifyOptions();
      this.selectedColorPallet = null;
      this.patternIntensity = trianglifyOptions.patternIntensity
      this.triangleVariance =  trianglifyOptions.triangleVariance
      this.cellSize =  trianglifyOptions.cellSize
      this.generateTrianglifyCanvas()
    },
    wallpaperSetEventHandler(event, err) {
      if (err) {
        this.$toast.error(err);
      } else {
        this.$toast.success("Wallpaper set!");
      }
    },
    cronSetWallpaperCommandHandler() {
        window.log.info("DesignerRoot handling random wallpaper set request.");

        let trianglifyOptions = randomizeTrianglifyOptions();

        let opts = {
          palette: this.palettes,
          width: this.selectedScreenWidth,
          height: this.selectedScreenHeight,
          cellSize:
            Math.max(this.selectedScreenWidth, this.selectedScreenHeight) *
            trianglifyOptions.cellSize,
          variance: trianglifyOptions.triangleVariance,
          xColors: 'random',
          colorFunction: memoizedInterpolateLinearColorFunction(trianglifyOptions.patternIntensity)
        };

        const pattern = trianglify(opts);
        const canvas = pattern.toCanvas(this.randomCronCanvas, {
          applyCssScaling: false // don't try to apply scaling with CSS
        });

        window.ipcRenderer.send("set-wallpaper-message", canvas.toDataURL());
        
        this.$toast.success("Wallpaper set!");
    },
    save: async function() {
      window.ipcRenderer.send("set-wallpaper-message", this.wallpaper);
    },
  },
  mounted() {
    window.ipcRenderer.on("set-wallpaper-reply", this.wallpaperSetEventHandler);
    window.cronSetWallpaperCommand(this.cronSetWallpaperCommandHandler);
    this.mainDesignerCanvas = document.getElementById("mainDesignerCanvas");
    this.randomCronCanvas = document.getElementById("randomCronCanvas");
  },
  destroyed() {
    window.ipcRenderer.removeListener(
      "set-wallpaper-reply",
      this.wallpaperSetEventHandler
    );
     window.cronSetWallpaperCommandRemove(this.cronSetWallpaperCommandHandler);
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
        fill: this.fill,
        strokeWidth: this.strokeWidth,
        colorFunction: memoizedInterpolateLinearColorFunction(this.patternIntensity)
      };

      if(this.selectedColorPallet !== null && this.selectedColorPallet) {
        opts.xColors = this.palettes[this.selectedColorPallet];
      }

      const pattern = trianglify(opts);
      const canvas = pattern.toCanvas(this.mainDesignerCanvas, {
        applyCssScaling: false // don't try to apply scaling with CSS
      });

      this.wallpaper = canvas.toDataURL();
      
    }, 1000 / 15);

    this.generateTrianglifyCanvas();
  }
};

function randomizeTrianglifyOptions () {
  return {
    patternIntensity: _.random(0.01, 1.0),
    triangleVariance: _.random(0.01, 1.0),
    cellSize: _.random(.02, .25)
  };
}


</script>
