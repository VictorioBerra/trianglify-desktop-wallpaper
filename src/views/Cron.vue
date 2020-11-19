<template>
  <div class="about">
    <VueCronEditorVuetify v-model="cronExpression"/>
  </div>
</template>
<script>
import VueCronEditorVuetify from 'vue-cron-editor-vuetify';
export default {
  components: {
    VueCronEditorVuetify
  },
  data: () => ({
      cronExpression: "*/1 * * * *"
  }),
}
</script>
