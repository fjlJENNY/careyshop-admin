import Vue from 'vue'
import App from './App'

import 'flex.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import screenfull from 'screenfull'
import '@/components'
import '@/assets/svg-icons'
import '@/mock/register'
import '@/plugin/axios'
import util from '@/utils/util'
import store from '@/store/index'
import pluginLog from '@/plugin/log'
import pluginError from '@/plugin/error'
import pluginOpen from '@/plugin/open'

// 菜单和路由设置
import router from './router'
import { menuHeader, menuAside } from '@/menu'
import { frameInRoutes } from '@/router/routes'

Vue.use(ElementUI)
Vue.use(pluginLog)
Vue.use(pluginError)
Vue.use(pluginOpen)

Vue.config.productionTip = false

Vue.prototype.$env = process.env.NODE_ENV
Vue.prototype.$baseUrl = process.env.BASE_URL

new Vue({
  router,
  store,
  render: h => h(App),
  created() {
    // 处理路由 得到每一级的路由设置
    this.getAllPageFromRoutes()
    // 设置顶栏菜单
    this.$store.commit('menuHeaderSet', menuHeader)
  },
  mounted() {
    // 获取并记录用户 UA
    this.$store.commit('uaGet')
    // 展示系统信息
    util.showInfo()
    // 用户登陆后从数据库加载一系列的设置
    this.$store.commit('loginSuccessLoad')
    // 初始化全屏监听
    this.fullscreenListenerInit()
  },
  watch: {
    // 监听路由 控制侧边栏显示
    '$route.matched'(val) {
      const _side = menuAside.filter(menu => menu.path === val[0].path)
      this.$store.commit('menuAsideSet', _side.length > 0 ? _side[0].children : [])
    }
  },
  methods: {
    /**
     * 初始化全屏监听
     */
    fullscreenListenerInit() {
      if (screenfull.enabled) {
        screenfull.on('change', () => {
          if (!screenfull.isFullscreen) {
            this.$store.commit('fullScreenSet', false)
          }
        })
      }
    },
    /**
     * 处理路由 得到所有的页面
     */
    getAllPageFromRoutes() {
      const pool = []
      const push = function(routes) {
        routes.forEach(route => {
          if (route.children) {
            push(route.children)
          } else {
            const { meta, name, path } = route
            pool.push({ meta, name, path })
          }
        })
      }
      push(frameInRoutes)
      this.$store.commit('pagePoolSet', pool)
    }
  }
}).$mount('#app')
