import Vue from 'vue'
import Vuetify, { VSnackbar, VBtn, VIcon } from 'vuetify/lib'
import VuetifyToast from 'vuetify-toast-snackbar'
import VuetifyConfirm from 'vuetify-confirm'

Vue.use(Vuetify, {
  components: {
    VSnackbar,
    VBtn,
    VIcon
  }
})

const veutifyObj = new Vuetify({
    theme: { dark: true },
});

Vue.use(VuetifyToast, { $vuetify: veutifyObj.framework })

Vue.use(VuetifyConfirm, { vuetify: veutifyObj })

export default veutifyObj;