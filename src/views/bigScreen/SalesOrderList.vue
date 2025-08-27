<template>
  <div class="order-list">
    <div class="order-list-header">
      <div class="order-list-header-item">销售单号</div>
      <div class="order-list-header-item">客户名称</div>
      <div class="order-list-header-item">合计金额</div>
      <div class="order-list-header-item">业务人员</div>
    </div>
    <div class="order-list-content">
      <vue-seamless-scroll :data="salesOrderList" :class-option="scrollOption" class="scroll-wrap">
        <div class="order-list-row" v-for="item in salesOrderList" :key="item.id">
          <div class="order-list-item">
            {{ item.orderId }}
          </div>
          <div class="order-list-item">
            <span :title="item.customerName">{{ item.customerName.length > 8 ? item.customerName.substring(0,8)+'...' : item.customerName }}</span>
          </div>
          <div class="order-list-item money">¥{{ item.totalAmount }}</div>
          <div class="order-list-item">
            {{ item.salesPerson }}
          </div>
        </div>
      </vue-seamless-scroll>
    </div>
  </div>
</template>
<script>
import vueSeamlessScroll from 'vue-seamless-scroll'
import { getAction } from '@/api/manage'

export default {
  name: 'SalesOrderList',
  components: {
    vueSeamlessScroll,
  },
  data() {
    return {
      salesOrderList: [],
      loading: false,
      refreshTimer: null,
      scrollOption: {
        direction: 1, // 0向上 1向下 2向左 3向右
        step: 0.3, // 数值越大速度越快
        limitMoveNum: 5, // 开始滚动的数据量阈值
        hoverStop: true, // 悬停暂停
        openWatch: true, // 开启数据监听
      },
    }
  },
  mounted() {
    this.loadSalesOrderData()
    // 每30秒刷新一次数据
    this.refreshTimer = setInterval(() => {
      this.loadSalesOrderData()
    }, 30000)
  },
  beforeDestroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    // 加载销售单数据
    async loadSalesOrderData() {
      this.loading = true
      try {
        const res = await getAction('/bigScreen/orderList', {
          type: "sales_order"
        })
        if (res.success) {
           const dataList = Array.isArray(res.result) ? res.result : (res.result.records || [])
           this.salesOrderList = dataList.map(item => ({
             id: item.id,
             orderId: item.orderNo || item.orderId,
             customerName: item.customerName,
             totalAmount: item.transactionAmount || item.totalAmount || item.amount || 0,
             salesPerson: item.businessPerson
           }))
        } else {
          console.error('获取销售单数据失败：', res.message)
          // 如果接口失败，使用模拟数据作为备用
        }
      } catch (error) {
        console.error('获取销售单数据异常：', error)
        // 网络异常时使用模拟数据
      } finally {
        this.loading = false
      }
    },
    
    // 手动刷新数据
    refreshData() {
      this.loadSalesOrderData()
    }
  },
}
</script>
<style lang="less" scoped>
.order-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  .order-list-header {
    display: flex;
    .order-list-header-item {
      flex: 1;
      color: rgb(122, 204, 255);
      font-size: 14px;
      text-align: center;
      line-height: 40px;
    }
  }
  .order-list-content {
    flex: 1;
    overflow: hidden;
    .scroll-wrap {
      height: 100%;
      overflow: hidden;
    }
    .order-list-row {
      display: flex;
      &:nth-child(even) {
        background-color: rgba(24, 144, 255, 0.15); /* 偶数行背景色 */
      }
      .order-list-item {
        width: 25%;
        color: #fff;
        font-size: 14px;
        text-align: center;
        line-height: 40px;
      }
      .money {
        color: rgb(255, 133, 44);
      }
    }
  }
}
</style>
