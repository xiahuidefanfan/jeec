<template>
  <div class="business-overview-container">
    <div class="summary-section">
      <div class="summary-item">
        <div class="summary-icon-wrapper purchase-icon-bg">
          <img src="@/assets/images/bigScreen/business-overview-icon1.svg" alt="purchase icon" class="summary-icon" />
          <img src="@/assets/images/bigScreen/business-overview-icon2.svg" alt="purchase icon" class="summary-icon" />
          <img src="@/assets/images/bigScreen/business-overview-icon3.svg" alt="purchase icon" class="summary-icon" />
          <img src="@/assets/images/bigScreen/business-overview-icon4.svg" alt="purchase icon" class="summary-icon" />
        </div>
        <div class="summary-content">
          <div class="summary-title">未回款金额</div>
          <div class="summary-value">
            <span class="amount">{{ uncollectedAmount.toLocaleString() }}</span>
            <span class="unit"> / 元</span>
          </div>
        </div>
      </div>
      <div class="summary-divider"></div>
    </div>
    <div class="order-list">
    <div class="order-list-header">
      <div class="order-list-header-item">项目</div>
      <div class="order-list-header-item">运单号</div>
      <div class="order-list-header-item">合计金额</div>
      <div class="order-list-header-item">开票</div>
      <div class="order-list-header-item">账期</div>
    </div>
    <div class="order-list-content">
      <div class="order-list-content">
        <vue-seamless-scroll :data="uncollectedOrderList" :class-option="scrollOption" class="scroll-wrap">
          <div class="order-list-row" v-for="item in uncollectedOrderList" :key="item.distributeOrderNo">
            <div class="order-list-item">
              <span :title="item.contractNo">{{ item.contractNo.length > 8 ? item.contractNo.substring(0,8)+'...' : item.contractNo }}</span>
            </div>
            <div class="order-list-item">
              <span :title="item.distributeOrderNo">{{ item.distributeOrderNo.length > 8 ? item.distributeOrderNo.substring(0,8)+'...' : item.distributeOrderNo }}</span>
            </div>
            <div class="order-list-item money">¥{{item.moneyCount}}</div>
            <div class="order-list-item">{{ item.hadInvoice }}</div>
            <div class="order-list-item">{{ item.paymentDue }}</div>
          </div>
        </vue-seamless-scroll>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import vueSeamlessScroll from 'vue-seamless-scroll'
import { getAction } from '@/api/manage'

export default {
  name: 'UncollectedAmount',
  components: {
    vueSeamlessScroll,
  },
  data() {
    return {
      uncollectedAmount: 0, // 初始化为0，将从后端获取
      uncollectedOrderList: [],
      scrollOption: {
        direction: 1, // 0向上 1向下 2向左 3向右
        step: 0.3, // 数值越大速度越快
        limitMoveNum: 6, // 开始滚动的数据量阈值
        hoverStop: true, // 悬停暂停
        openWatch: true, // 开启数据监听
      },
    }
  },
  mounted() {
    this.getUncollectedAmount()
  },
  methods: {
    getUncollectedAmount() {
      // 调用后端接口获取累计发货金额
      getAction('/bigScreen/uncollectedAmount').then(res => {
        if (res.success) {
          this.uncollectedAmount = res.result.uncollectedAmount || 0
          this.uncollectedOrderList = res.result.list
        } else {
          console.error('获取累计金额数据失败:', res.message)
        }
      }).catch(error => {
        console.error('获取发货金额失败:', error)
        this.uncollectedAmount = 0
      })
    }
    },
    // 刷新所有数据
    refreshData() {
      this.getUncollectedAmount()
    }
}
</script>

<style lang="less" scoped>
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@keyframes rotate-reverse {
  0% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
}

.business-overview-container {
  //   padding: 20px;
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif; // 更接近截图字体
  height: 100%;
  display: flex;
  flex-direction: column;
}

.summary-section {
  padding: 20px 10px;
  display: flex;
  justify-content: space-around; // 分散对齐，中间留有空隙
  align-items: center;
}

.summary-item {
  display: flex;
  align-items: center;
  // background-color: rgba(25, 44, 75, 0.5); // 移除独立背景，让整体背景生效
  // padding: 15px 25px; // 调整内边距
  // border-radius: 8px; // 移除圆角
  // min-width: 300px; // 移除最小宽度，让其自适应
  flex: 1; // 占据可用空间
  justify-content: center; // 内容居中
  position: relative; // 用于分隔线定位
}

.summary-divider {
  width: 1px;
  height: 60px; // 分隔线高度
  background-color: rgba(255, 255, 255, 0.2); // 分隔线颜色
  margin: 0 20px; // 调整分隔线左右间距
}

.summary-icon-wrapper {
  margin-right: 15px;
  position: relative;
  width: 64px; // 调整图标背景大小
  height: 64px;
}

.summary-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  &:nth-child(1) {
    width: 60px;
    height: 60px;
    animation: rotate 8s linear infinite;
  }
  &:nth-child(2) {
    width: 60px;
    height: 60px;
    animation: rotate 8s linear infinite;
  }
  &:nth-child(3) {
    width: 50px;
    height: 50px;
    animation: rotate-reverse 8s linear infinite;
  }
  &:nth-child(4) {
    width: 32px;
    height: 32px;
  }
}

.summary-content {
  .summary-title {
    font-family: SimHei;
    font-size: 14px;
    color: rgb(230, 247, 255);
    letter-spacing: 2px;
    font-weight: normal;
    font-style: normal;
    transform: translate(6px, 0px);
    word-break: keep-all;
  }
  .summary-value {
    display: flex;
    white-space: nowrap;
    .amount {
      align-items: center;
      color: rgb(255, 255, 255);
      font-size: 34px;
      font-family: DINPro-Bold;
      font-weight: bold;
      font-style: normal;
      text-shadow: rgb(0, 105, 255) 0px 0px 10px;
      letter-spacing: 2px;
    }
    .unit {
      display: inline-flex;
      align-items: center;
      color: rgb(122, 204, 255);
      font-size: 14px;
      font-family: DINPro-Medium;
      letter-spacing: 0px;
      font-weight: normal;
      font-style: normal;
      transform: translate(0px, 4px);
    }
    .unit2 {
      color: rgb(255, 133, 44);
    }
  }
}
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
      height: 240px; // 6条数据 × 40px/条
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
