<template>
  <div class="order-list">
    <div class="order-list-header">
      <div class="order-list-header-item">采购单号</div>
      <div class="order-list-header-item">供应商名称</div>
      <div class="order-list-header-item">合计金额</div>
      <div class="order-list-header-item">业务人员</div>
    </div>
    <div class="order-list-content">
      <vue-seamless-scroll :data="purchaseOrderList" :class-option="scrollOption" class="scroll-wrap">
        <div class="order-list-row" v-for="item in purchaseOrderList" :key="item.id">
          <div class="order-list-item">
            {{ item.orderId }}
          </div>
          <div class="order-list-item">
            <span :title="item.supplierName">{{ item.supplierName.length > 8 ? item.supplierName.substring(0,8)+'...' : item.supplierName }}</span>
          </div>
          <div class="order-list-item money">¥{{ item.totalAmount }}</div>
          <div class="order-list-item">
            {{ item.purchasePerson }}
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
  name: 'PurchaseOrderList',
  components: {
    vueSeamlessScroll,
  },
  data() {
    return {
      purchaseOrderList: [],
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
    this.loadPurchaseOrderData()
    // 设置定时刷新，每30秒刷新一次
    this.refreshTimer = setInterval(() => {
      this.refreshData()
    }, 30000)
  },
  beforeDestroy() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    // 加载采购单数据
    async loadPurchaseOrderData() {
      try {
        this.loading = true
        const res = await getAction('/bigScreen/orderList', {
          type: "pur_order"
        })
        if (res.success) {
          const dataList = Array.isArray(res.result) ? res.result : (res.result.records || [])
          this.purchaseOrderList = dataList.map(item => ({
            id: item.id,
            orderId: item.orderNo || item.orderId,
            supplierName: item.supplierName,
            totalAmount: item.transactionAmount || item.totalAmount || item.amount || 0,
            purchasePerson: item.businessPerson
          }))
        } else {
          console.error('获取采购单数据失败：', res.message)
          // 如果接口失败，使用模拟数据作为备用
          this.purchaseOrderList = [
            { id: 1, orderId: 'PO202401001', supplierName: '测试供应商A有限公司', totalAmount: 125000, purchasePerson: '张三' },
            { id: 2, orderId: 'PO202401002', supplierName: '优质供应商B公司', totalAmount: 89000, purchasePerson: '李四' },
            { id: 3, orderId: 'PO202401003', supplierName: '长期合作伙伴C集团', totalAmount: 256000, purchasePerson: '王五' }
          ]
        }
      } catch (error) {
        console.error('采购单数据加载异常:', error)
        // 网络异常时使用模拟数据
        this.purchaseOrderList = [
          { id: 1, orderId: 'PO202401001', supplierName: '测试供应商A有限公司', totalAmount: 125000, purchasePerson: '张三' },
          { id: 2, orderId: 'PO202401002', supplierName: '优质供应商B公司', totalAmount: 89000, purchasePerson: '李四' },
          { id: 3, orderId: 'PO202401003', supplierName: '长期合作伙伴C集团', totalAmount: 256000, purchasePerson: '王五' },
          { id: 4, orderId: 'PO202401004', supplierName: '新兴供应商D企业', totalAmount: 67000, purchasePerson: '赵六' },
          { id: 5, orderId: 'PO202401005', supplierName: '稳定合作E供应商', totalAmount: 198000, purchasePerson: '钱七' }
        ]
      } finally {
        this.loading = false
      }
    },
    
    // 刷新数据
    refreshData() {
      if (!this.loading) {
        this.loadPurchaseOrderData()
      }
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
