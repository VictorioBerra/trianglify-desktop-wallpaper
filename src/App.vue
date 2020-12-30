<template>
  <v-app>
    <v-app-bar
      app
      class="mt-5"
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

      <template slot="extension">
              <v-tabs
        color="deep-orange accent-2"
      icons-and-text>
        <v-tab to="/">DESIGNER <v-icon>mdi-palette</v-icon></v-tab>
        <v-tab to="/cron">SCHEDULE <v-icon>mdi-alarm</v-icon></v-tab>
      </v-tabs>
      </template>

    </v-app-bar>

    <v-main>
    <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <keep-alive>
            <router-view></router-view>
        </keep-alive>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'trianglify-wallpaper',
  data: () => ({
    //
  })
}