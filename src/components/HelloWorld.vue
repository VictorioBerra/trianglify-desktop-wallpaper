<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/logo.svg')"
          class="my-3"
          contain
          height="200"
        />
      </v-col>

      <v-col class="mb-4">
      </v-col>

      <v-col
        class="mb-5"
        cols="12"
      >
        <h2 class="headline font-weight-bold mb-3">
          What's next?
        </h2>

        <v-row justify="center">
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import trianglify from 'trianglify'
  export default {
    name: 'HelloWorld',
    created: () => {
      const pattern = trianglify({
        width: 1024,
        height: 1024
      });

      pattern.toSVG();
      pattern.toCanvas();
    },
    data: () => ({
    }),
  }
</script>
