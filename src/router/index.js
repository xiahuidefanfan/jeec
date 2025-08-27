import Vue from 'vue'
import Router from 'vue-router'
import { constantRouterMap } from '@/config/router.config'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  {
    path: '/big-screen/fullscreen',
    name: 'BigScreenFullscreen',
    component: () => import('@/views/bigScreen/index'),
    meta: { title: '大屏全屏展示', hideMenu: true, fullscreen: true }
  },
]