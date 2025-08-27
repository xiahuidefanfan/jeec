<template>
  <div class="big-screen-container">
    <a-button 
      type="primary" 
      icon="fullscreen" 
      @click="openFullscreen"
      style="position: fixed; right: 24px; bottom: 24px; z-index: 999;"
    >
      全屏展示
    </a-button>
    <div class="dashboard-container">
    <!-- 操作按钮组 -->
    <div class="action-buttons">
      <!-- 新窗口打开按钮 -->
      <div class="action-btn" @click="openInNewWindow">
        <a-icon type="export" />
        <span>新窗口打开</span>
      </div>
      <!-- 全屏按钮 -->
      <div class="action-btn" @click="toggleFullscreen">
        <a-icon :type="isFullscreen ? 'fullscreen-exit' : 'fullscreen'" />
        <span>{{ isFullscreen ? '退出全屏' : '全屏显示' }}</span>
      </div>
    </div>
    <div class="dashboard">
      <Header />
      <Side style="left: 0; transform: rotate(180deg)" />
      <Side style="right: 0" />
      <Footer />
      <div class="dashboard-body">
        <div class="col">
          <Box title="已发货金额" :height="400">
            <ShippedAmount />
          </Box>
          <Box title="销售单实况" :height="300">
            <SalesOrderList ref="salesOrderList" />
          </Box>
        </div>
        <div class="col">
          <Box title="经营概况" :height="400">
            <BusinessOverview />
          </Box>
          <Box title="采购单实况" :height="300">
            <PurchaseOrderList ref="purchaseOrderList" />
          </Box>
        </div>
        <div class="col">
          <Box title="未回款金额" :height="400">
            <UncollectedAmount />
          </Box>
          <Box title="系统提醒" :height="300">
            <Alerts />
          </Box>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import Header from './Header.vue'
import Footer from './Footer.vue'
import Side from './Side.vue'
import Box from './Box.vue'
import SalesOrderList from './SalesOrderList.vue'
import PurchaseOrderList from './PurchaseOrderList.vue'
import BusinessOverview from './BusinessOverview.vue'
import ShippedAmount from './ShippedAmount.vue'
import InventoryInfo from './InventoryInfo.vue'
import InventoryDistribution from './InventoryDistribution.vue'
import UncollectedAmount from '@/views/bigScreen/UncollectedAmount.vue'
import Alerts from '@/views/bigScreen/Alerts.vue'
import StockAge from './StockAge.vue'

export default {
  methods: {
    openFullscreen() {
      const routeData = this.$router.resolve({ path: '/big-screen/fullscreen' })
      window.open(routeData.href, '_blank', 'fullscreen=yes')
    }
  },
  name: 'Dashboard',
  components: {
    UncollectedAmount,
    Header,
    Footer,
    Side,
    Box,
    Alerts,
    SalesOrderList,
    PurchaseOrderList,
    BusinessOverview,
    ShippedAmount,
    InventoryInfo,
    InventoryDistribution,
    StockAge,
  },
  data() {
    return {
      currentTime: '',
      isFullscreen: false,
      alerts: [],
    }
  },
  mounted() {
    this.adjustScale()
    this.renderChart()
    window.addEventListener('resize', this.adjustScale)
    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', this.handleFullscreenChange)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.adjustScale)
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)
  },
  methods: {
    adjustScale() {
      const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
      document.querySelector('.dashboard').style.transform = `translate(-50%,-50%) scale(${scale})`
    },
    handleFullscreenChange() {
      this.isFullscreen = !!document.fullscreenElement
    },
    renderChart() {
      if (this.$refs.materialDistribution) {
        this.$refs.materialDistribution.renderChart()
      }
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        // 进入全屏
        document.documentElement.requestFullscreen().then(() => {
          this.isFullscreen = true
        }).catch(err => {
          console.error('无法进入全屏模式:', err)
          this.$message.error('无法进入全屏模式')
        })
      } else {
        // 退出全屏
        document.exitFullscreen().then(() => {
          this.isFullscreen = false
        }).catch(err => {
          console.error('无法退出全屏模式:', err)
          this.$message.error('无法退出全屏模式')
        })
      }
    },
    openInNewWindow() {
      // 获取当前页面的URL
      const currentUrl = window.location.href
      // 在新窗口中打开大屏页面
      const newWindow = window.open(
        currentUrl,
        'bigScreen',
        'width=1920,height=1080,scrollbars=no,resizable=yes,status=no,toolbar=no,menubar=no,location=no'
      )
      
      if (newWindow) {
        // 聚焦到新窗口
        newWindow.focus()
        this.$message.success('已在新窗口中打开大屏')
      } else {
        this.$message.error('无法打开新窗口，请检查浏览器弹窗设置')
      }
    },
  },
}
</script>

<style scoped>
@font-face {
  font-family: bigScreen-title;
  src: url('../../assets/fonts/bigScreen-title.ttf');
}
@font-face {
  font-family: bigScreen-time;
  src: url('../../assets/fonts/bigScreen-time.otf');
}
.dashboard-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('../../assets/images/bigScreen/bg.jpg');
  background-size: cover;
  /* pointer-events: none; */
}

.action-buttons {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
  pointer-events: auto;
}

.action-btn {
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.action-btn .anticon {
  font-size: 16px;
}
.dashboard {
  position: absolute;
  width: 1920px;
  height: 1080px;
  top: 50%;
  left: 50%;
  background-color: rgb(0, 0, 0, 0.75);
  pointer-events: none;
  overflow: hidden;
  filter: unset;
  .dashboard-body {
    padding: 140px 60px 100px 60px;
    width: 100%;
    height: 100%;
    display: flex;
    .col {
      flex: 1;
    }
  }
}
</style>
