<template>
  <div>
    <v-card class="grey darken-4">
      <v-card-title>
        <span class="caption">Click a color box to edit it.</span>
      </v-card-title>

      <v-card-text>
        <v-card class="d-flex" flat tile>
            <v-btn icon tile small @click="randomPalette"
              ><v-icon>mdi-shuffle-variant</v-icon>
              </v-btn
            >
            <Palette v-bind:colors="palette" v-bind:selectable="true" />
            <v-btn icon tile small @click="addColor"
              ><v-icon>mdi-plus</v-icon></v-btn
            >
            <v-btn icon tile small @click="removeColor" :disabled="removeDisabled"
              ><v-icon>mdi-minus</v-icon></v-btn
            >
        </v-card>
      </v-card-text>
      <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text v-on:click="save"> Save </v-btn>
        </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import chroma from 'chroma-js'
import _ from "lodash";

import Palette from './Palette'

export default {
    components: {
        Palette
    },
    data: () => ({
        palette: ['#9ebcda', '#8c96c6', '#8c6bb1', '#88419d']
    }),
    computed: {
        removeDisabled(){
            return this.palette.length <= 1;
        }
    },
    methods: {
        addColor(){
            this.palette.push(chroma(_.last(this.palette)).darken().saturate(2).hex());
        },
        removeColor(){
            this.palette.pop();
        },
        save(){
            this.$emit('save', this.palette);
            this.randomPalette();
        },
        randomPalette(){
            this.palette = chroma
                .scale([chroma.random(),chroma.random()])
                .mode('lch')
                .colors(6);
        }
    }
};
</script>

<style></style>
