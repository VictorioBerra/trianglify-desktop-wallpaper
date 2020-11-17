<template>
  <v-app>
    <v-app-bar app dark>
      <div class="d-flex align-center">
        <v-img
          alt="Trianglify Wallpaper Logo"
          class="shrink mr-2"
          contain
          src="./assets/logo.png"
          transition="scale-transition"
          width="40"
        />
      </div>

      <v-toolbar-title>Trianglify Wallpaper Preferences</v-toolbar-title>

      <v-spacer></v-spacer>

    </v-app-bar>

    <v-main>
      <v-container>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="imageFolder"
            :rules="imageFolderRules"
            label="Image Save Folder"
            required
          ></v-text-field>
        </v-form>
      </v-container>
    </v-main>
    <v-footer padless>
      <v-row justify="center" no-gutters>
        <v-col>
          <v-btn v-on:click="close" tile block>
            Close
          </v-btn>
          <v-btn 
          color="success" 
          v-on:click="save" 
          tile 
          block
          :disabled="!valid">
            Save
          </v-btn>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "trianglify-wallpaper-preferences",
  methods: {
    close () {
      window.hideWindow()
    },
    async save () {
      this.$refs.form.validate()
      if(this.valid) {
        await window.settings.set('image.folder', this.imageFolder);
        window.hideWindow()
      }
    }
  },
  created: async function() {
    this.imageFolder = window.settings.getSync('image.folder');
  },
  data: () => ({
    valid: true,
    imageFolder: null,
    imageFolderRules: [
      v => !!v || 'Image Save Folder is required'
    ],
  }),
};
</script>
