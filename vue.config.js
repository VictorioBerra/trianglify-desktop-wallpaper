module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        publish: ['github']
      },
      preload: {
        preload: 'src/preload.js',
        preloadPreferences: 'src/preload-preferences.js'
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
    }
  }
}