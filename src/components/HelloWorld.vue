<template>
  <v-container>
    <v-row class="mb-6">
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
            color="primary"
          >
            <v-list-item
              v-for="(screen, i) in screens"
              :key="i"
            >
              <v-list-item-content>
                <v-list-item-title>{{screen.id}}</v-list-item-title>
                <v-list-item-subtitle>W{{screen.size.width}} x H{{screen.size.height}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>

      <v-col
        cols="8"
      >

        <v-img v-bind:src="wallpaper" />
        
        <v-btn v-on:click="generate"
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

<script>
import trianglify from 'trianglify'
// import { v4 as uuidv4 } from "uuid"

export default {
  data: () => ({
    screens: [],
    wallpaper: null
  }),
  name: 'HelloWorld',
  created: function(){

    this.tempPath = window.ipcRenderer.sendSync('get-path-message', 'temp');
    console.log(`Saving to: ${this.tempPath}`);
    const screens = window.ipcRenderer.sendSync('get-screens-message');

    this.screens = screens.map(function(screen){
      return {
        size: screen.size,
        id: screen.id
      };
    });

    this.generate();

  },
  methods: {
    generate: function()
    {
      // todo use primary size
        const pattern = trianglify({
          width: this.screens[0].size.width,
          height: this.screens[0].size.height
        });

        const canvas = pattern.toCanvas();

        this.wallpaper = canvas.toDataURL();
    },
    save: async function()
    {
        // const pattern = trianglify({
        //   width: 1024,
        //   height: 1024
        // });

        // const canvas = pattern.toCanvas();

        // // See the node-canvas docs for a full
        // // list of all the things you can do with this Canvas object:
        // // https://github.com/Automattic/node-canvas
        // var newWallpaperDataUrl = canvas.toDataURL();

        window.ipcRenderer.on('set-wallpaper-reply', () => {
          // some UI thing?
        })
        window.ipcRenderer.send('set-wallpaper-message', this.wallpaper)


        //         const fileName = path.join(this.tempPath, 'images', `${uuidv4().toString()}.png`)
        // const file = fs.createWriteStream(fileName)
    }
  }
}
</script>
