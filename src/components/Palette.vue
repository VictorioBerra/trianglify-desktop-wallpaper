<template>
  <div>
    <!-- v-dialog width to match canvas 300 -->
    <v-dialog v-model="dialog" width="300"> 
      <template v-slot:activator="{ on, attrs }">
        <v-card class="d-md-flex" flat tile>
          <v-card
            v-for="(color, index) in colors"
            :key="index"
            :style="{ backgroundColor: color }"
            class="pa-4 flex-grow-1"
            tile
            v-bind="attrs"
            @click="editColor(color, index)"
            v-on="on"
          >
          </v-card>
        </v-card>
      </template>
      <v-card>
        <v-color-picker
          class=""
          show-swatches
          hide-mode-switch
          hide-inputs
          mode="hexa"
          v-model="editingColor"
        ></v-color-picker>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" text @click="dialog = false">
            Close
          </v-btn>
          <v-btn color="primary" text @click="saveColor"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    selectable: {
      type: Boolean,
      default: false,
    },
    colors: {
      type: Array,
    },
  },
  data: () => ({
    dialog: false,
    editingColor: null,
    editingIndex: null,
  }),
  computed: {},
  methods: {
    saveColor() {
      this.colors[this.editingIndex] = this.editingColor;

      this.dialog = false;
    },
    editColor(color, index) {
      if(this.selectable) {
        this.editingColor = color;
        this.editingIndex = index;

        this.dialog = true;
      }
    },
  },
};
</script>
