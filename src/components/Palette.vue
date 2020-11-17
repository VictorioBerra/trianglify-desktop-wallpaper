<template>
  <div>
    <v-card class="d-flex" flat tile>
      <v-card
        v-for="color in colors"
        :key="color"
        :style="{ backgroundColor: color }"
        class="pa-4 flex-grow-1"
        tile
      >
      </v-card>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Palette",
  props: ["colors"],
};
</script>
