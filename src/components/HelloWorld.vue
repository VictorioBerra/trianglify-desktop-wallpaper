<template>
  <v-container fluid>
    <v-row class="mb-6" justify="center">
      <!-- <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col> -->

      <v-col
        cols="4">
        <v-list dense>
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
        </v-list>

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
          </v-row>

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



          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>

      </v-col>

      <v-col
        cols="8"
      >

        <canvas id="c" height="900" width="1440" />
        
        <v-btn v-on:click="generateTrianglifyCanvas"
          class="mt-6"
          elevation="2"
          color="primary"
        >Generate</v-btn>
      </v-col>
    </v-row>
    <v-row>
        <v-col
          cols="12"
          sm="4"
        >
          <v-btn v-on:click="save"
            elevation="2"
            color="success"
          >Save</v-btn>
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
    filter: drop-shadow(2px 2px 8px rgba(0,0,0,.2));
  }
</style>
<script>
import trianglify from 'trianglify'
import _ from 'lodash'

export default {
  data: () => ({
    customizationPanel: 0,
    screens: [],
    wallpaper: null,

    selectedScreenId: null,
    selectedScreen: null,
    selectedScreenHeight: null,
    selectedScreenWidth: null,

    triangleVariance: 0.21,
    cellSize: 0.05,

  }),
  watch: {
    selectedScreenId: function (val) {
      let selectedScreen = this.screens.find(x => x.id == val);
      this.selectedScreen = selectedScreen;
      this.selectedScreenHeight = selectedScreen.size.height;
      this.selectedScreenWidth = selectedScreen.size.width;
    },
    selectedScreenWidth: function(newValue, oldValue) {
        this.vueCanvas.clearRect(0, 0, oldValue, oldValue);
        this.generateTrianglifyCanvas()
    },
    selectedScreenHeight: function(newValue, oldValue) {
        this.vueCanvas.clearRect(0, 0, oldValue, oldValue);
        this.generateTrianglifyCanvas()
    },
    triangleVariance: function() {
        this.generateTrianglifyCanvas()
    },
    cellSize: function() {
        this.generateTrianglifyCanvas()
    },
  },
  // computed: {
  //   selectedScreen: function () {
  //    
  //   }
  // },
  name: 'HelloWorld',
  mounted (){
    window.ipcRenderer.on('set-wallpaper-reply', this.wallpaperSetEventHandler)
    // How to unmount this?
    var c = document.getElementById("c")
    var ctx = c.getContext("2d")
    this.vueCanvas = c;
    this.vueCanvasContext = ctx;
  },
  destroyed () {
    window.ipcRenderer.removeListener('set-wallpaper-reply', this.wallpaperSetEventHandler)
  },
  created: function() {

    this.tempPath = window.ipcRenderer.sendSync('get-path-message', 'temp');
    const screens = window.ipcRenderer.sendSync('get-screens-message');

    this.screens = screens.all.map(function(screen){
      return {
        size: screen.size,
        id: screen.id,
        isPrimary: screen.id === screens.primary.id
      };
    });

    let selectedScreen = this.screens.find(x => x.isPrimary);
    this.selectedScreenId = selectedScreen.id;
    
    // https://stackoverflow.com/a/49780382/1777780
    this.generateTrianglifyCanvas = _.debounce(() => {

            let opts = {
              width: this.selectedScreenWidth,
              height: this.selectedScreenHeight,
              cellSize: Math.max(this.selectedScreenWidth, this.selectedScreenHeight) * this.cellSize,
              variance: this.triangleVariance
            }

            const pattern = trianglify(opts);
            const canvas = pattern.toCanvas(this.vueCanvas, {
              applyCssScaling: false
            })
            
            this.wallpaper = canvas.toDataURL()
      }, 300)

    this.generateTrianglifyCanvas();

  },
  methods: {
    wallpaperSetEventHandler(event, err) {
      if(err) {
        this.$toast.error(err);
      } else {
        this.$toast.success("Wallpaper set!");
      }
    },
    save: async function()
    {
        window.ipcRenderer.send('set-wallpaper-message', this.wallpaper)
    }
  }
}
</script>
