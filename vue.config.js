module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: [
          {
            provider: 'github',
            releaseType: 'release',
          },
        ],
      },
      preload: {
        preload: 'src/preload.js',
        preloadPreferences: 'src/preload-preferences.js',
        preloadAbout: 'src/preload-about.js',
      }
    }
  },
  "transpileDependencies": [
    "vuetify"
  ],
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Trianglify Wallpaper'
    },
    preferences: {
      entry: 'src/main-preferences.js',
      template: 'public/index.html',
      title: 'Trianglify Wallpaper Preferences'
    },
    about: {
      entry: 'src/main-about.js',
      template: 'public/index.html',
      title: 'Trianglify Wallpaper About'
    }
  }
}