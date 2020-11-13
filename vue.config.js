module.exports = {
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js'
    }
  },
  "transpileDependencies": [
    "vuetify"
  ],
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Trianglify Wallpaper'
    }
  }
}