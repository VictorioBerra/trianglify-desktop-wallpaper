<template>
  <div class="about">
    <p>Randomly set the wallpaper at specific intervals.</p>
    <v-checkbox label="Enabled" v-model="enableRandomCron" />
    <VueCronEditorVuetify v-model="randomCronExpression"/>
  </div>
</template>
<script>
import VueCronEditorVuetify from 'vue-cron-editor-vuetify';
export default {
  components: {
    VueCronEditorVuetify
  },
  computed: {
    randomCronExpression: {
      get () {
        return this.$store.state.randomCronExpression
      },
      async set (value) {
        await this.$store.dispatch('randomCronExpression', value)
      }
    },
    enableRandomCron: {
      get () {
        return this.$store.state.enableRandomCron
      },
      async set (value) {
        await this.$store.dispatch('enableRandomCron', value)
      }
    },
  },
  data: () => ({
  }),
}
</script>
