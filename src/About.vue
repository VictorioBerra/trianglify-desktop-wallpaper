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

      <v-toolbar-title>Trianglify Wallpaper About</v-toolbar-title>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main>
      <v-container>
        <strong>Author: </strong><p>Victorio Berra</p>
        <strong>Website/Issues/Docs: </strong><p><a href="https://github.com/VictorioBerra/trianglify-desktop-wallpaper">https://github.com/VictorioBerra/trianglify-desktop-wallpaper</a></p>
        <strong>Version: </strong><p>{{ version }}</p>
      </v-container>
    </v-main>
    <v-footer padless>
      <v-row justify="center" no-gutters>
        <v-col>
          <v-btn v-on:click="close" tile block>
            Close
          </v-btn>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "trianglify-wallpaper-about",
    methods: {
    close() {
      window.hideWindow();
    },
  },
  async mounted() {
    this.version = await window.getAppVersion(this.backupWallpaperReply);
  },
  data: () => ({
    version: "loading"
  }),
};
</script>
