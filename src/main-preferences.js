import Vue from 'vue'
import App from './AppPreferences.vue'
import vuetify from './plugins/vuetify';
import store from './plugins/vuex'

Vue.config.productionTip = false

new Vue({
  vuetify,
  store: store({
    createPersistedState: window.createPersistedState,
    createSharedMutations: window.createSharedMutations
  }),
  render: h => h(App)
}).$mount('#app')
