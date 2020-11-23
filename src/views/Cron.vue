<template>
  <div class="about">
    <p>Randomly set the wallpaper at specific intervals.</p>
    <v-checkbox label="Enabled" v-model="enableRandomCron" />

    <VueCronEditorVuetify v-model="randomCronExpression"/>

    <v-text-field class="mt-4"
      label="Webhook"
      persistent-hint
      hint="Send an HTTP POST to a URL when the wallpaper is changed."
      v-model="randomCronWebhook"
    ></v-text-field>
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
    randomCronWebhook: {
      get () {
        return this.$store.state.randomCronWebhook
      },
      async set (value) {
        await this.$store.dispatch('randomCronWebhook', value)
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
