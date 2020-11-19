import Vue from 'vue'
import VueRouter from 'vue-router'
import Designer from '../views/Designer.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Designer',
    component: Designer
  },
  {
    path: '/cron',
    name: 'Cron',
    // route level code-splitting
    // this generates a separate chunk (cron.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "cron" */ '../views/Cron.vue')
  }
]

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
