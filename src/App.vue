<template>
  <v-app>
    <v-app-bar
      app
      class="pt-5 transparent"
      dark
      flat
    >

      <div class="d-flex align-center">
        <v-img
          alt="Trianglify Wallpaper Logo"
          class="shrink mr-2"
          contain
          src="./assets/logo.png"
          transition="scale-transition"
          width="30"
        />
      </div>

      <v-toolbar-title>Trianglify Wallpaper</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn> -->
    </v-app-bar>

    <v-main>
      <Trianglify />
    </v-main>
  </v-app>
</template>

<script>
import Trianglify from './components/Trianglify';

export default {
  name: 'trianglify-wallpaper',

  components: {
    Trianglify,
  },

  data: () => ({
    //
  }),
};
</script>
