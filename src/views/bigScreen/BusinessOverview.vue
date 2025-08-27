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
          <div class="summary-title">累计采购金额</div>
          <div class="summary-value">
            <span class="amount">{{ purchaseAmount.toLocaleString() }}</span>
            <span class="unit"> / 元</span>
          </div>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <div class="summary-icon-wrapper sales-icon-bg">
          <img src="@/assets/images/bigScreen/business-overview-icon5.svg" alt="purchase icon" class="summary-icon" />
          <img src="@/assets/images/bigScreen/business-overview-icon6.svg" alt="purchase icon" class="summary-icon" />
          <img src="@/assets/images/bigScreen/business-overview-icon7.svg" alt="purchase icon" class="summary-icon" />
          <img src="@/assets/images/bigScreen/business-overview-icon8.svg" alt="purchase icon" class="summary-icon" />
        </div>
        <div class="summary-content">
          <div class="summary-title">累计销售金额</div>
          <div class="summary-value">
            <span class="amount">{{ salesAmount.toLocaleString() }}</span>
            <span class="unit unit2">/元</span>
          </div>
        </div>
      </div>
    </div>
    <div class="chart-section">
      <div class="chart-title-section">
        <div class="chart-main-title">
          <img src="@/assets/images/bigScreen/business-overview-icon10.png" class="title-decorator"></img>
          <span class="chart-main-title-text">趋势图 ({{ chartDateRange }})</span>
          
        </div>
        <div class="chart-title-line"></div>
        <div class="chart-legend">
            <img src="@/assets/images/bigScreen/business-overview-icon9.png" class="title-arrow"></img>
            <img src="@/assets/images/bigScreen/business-overview-icon9.png" class="title-arrow"></img>
        </div>
      </div>
      <div id="trendChart" class="trend-chart"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { getAction } from '@/api/manage'

export default {
  name: 'BusinessOverview',
  components: {},
  data() {
    return {
      purchaseAmount: 0, // 初始化为0，将从后端获取
      salesAmount: 0, // 初始化为0，将从后端获取
      trendChart: null,
      chartDateRange: '加载中...', // 动态显示时间范围
      trendData: {
        categories: [], // X轴数据（月份）
        purchaseData: [], // 采购金额数据
        salesData: [] // 销售金额数据
      },
      refreshTimer: null, // 定时刷新定时器
      chartOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
          backgroundColor: 'rgba(0,0,0,0.7)',
          borderColor: '#333',
          textStyle: {
            color: '#fff',
          },
        },
        legend: {
          show: true,
          orient: 'horizontal', // 水平排列
          right: 20, // 距离右边20px
          top: 0, // 距离顶部0px
          itemWidth: 13, // 图例标记的宽度
          itemHeight: 13, // 图例标记的高度
          itemGap: 13, // 图例项之间的间距
          textStyle: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: 13
          },
          data: [
          {
                name: '采购金额',
                // 使用 path 自定义图例标记为蓝色空心圆环，增大尺寸
                icon: 'path://M50,0 A50,50 0 1 1 50,100 A50,50 0 1 1 50,0 M50,10 A40,40 0 1 0 50,90 A40,40 0 1 0 50,10 Z',
                itemStyle: {
                  color: '#008FFB' // 与系列颜色一致
                }
              },
              {
                name: '销售金额',
                // 使用 path 自定义图例标记为橙色空心圆环，增大尺寸
                icon: 'path://M50,0 A50,50 0 1 1 50,100 A50,50 0 1 1 50,0 M50,10 A40,40 0 1 0 50,90 A40,40 0 1 0 50,10 Z',
                itemStyle: {
                  color: '#FFA500' // 与系列颜色一致
                }
              }
          ]
        },
        grid: {
          left: '20px', // 调整以适应Y轴名称
          right: '20px',
          bottom: '10px', // 调整以适应X轴标签
          top: '40px', // 给Y轴名称留出空间
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: [], // 将从后端获取
            axisLabel: {
              color: '#rgba(255,255,255,0.7)',
              fontSize: 12,
            },
            axisLine: {
                show: false,
              lineStyle: {
                color: 'rgba(255,255,255,0.2)',
              },
            },
            axisTick: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '万元',
            nameTextStyle: {
              color: 'rgba(230, 247, 255,0.7)',
              fontSize: 12,
              align: 'left',
              padding: [0, 0, 0, -25], // 根据实际情况调整Y轴单位位置
            },
            axisLabel: {
              color: 'rgba(255,255,255,1)',
              fontSize: 12,
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(255,255,255,0.1)',
                type: 'dashed',
              },
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: 'rgba(255,255,255,0.2)',
              },
            },
          },
        ],
        series: [
          {
            name: '采购金额',
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 2,
              color: '#008FFB', // 采购金额线条颜色
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(0, 143, 251, 0.35)', // 采购金额区域渐变起始色
                },
                {
                  offset: 1,
                  color: 'rgba(0, 143, 251, 0.05)', // 采购金额区域渐变结束色
                },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            data: [], // 将从后端获取
          },
          {
            name: '销售金额',
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 2,
              color: '#FFA500', // 销售金额线条颜色
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(255, 165, 0, 0.2)', // 销售金额区域渐变起始色
                },
                {
                  offset: 1,
                  color: 'rgba(255, 165, 0, 0.05)', // 销售金额区域渐变结束色
                },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            data: [], // 将从后端获取
          },
        ],
      },
    }
  },
  mounted() {
    this.initChart()
    // 获取累计采购金额和累计销售金额数据
    this.fetchTotalAmount()
    // 获取趋势图数据
    this.fetchTrendData()
    // 监听窗口大小变化，以便重新渲染图表
    window.addEventListener('resize', this.handleResize)
    // 设置定时刷新，每5分钟刷新一次数据
    this.refreshTimer = setInterval(() => {
      this.refreshData()
    }, 300000) // 5分钟
  },
  beforeDestroy() {
    if (this.trendChart) {
      this.trendChart.dispose()
      this.trendChart = null
    }
    window.removeEventListener('resize', this.handleResize)
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    initChart() {
      const chartDom = document.getElementById('trendChart')
      if (chartDom) {
        this.trendChart = echarts.init(chartDom)
        this.trendChart.setOption(this.chartOption)
      }
    },
    handleResize() {
      if (this.trendChart) {
        this.trendChart.resize()
      }
    },
    fetchTotalAmount() {
      // 调用后端接口获取累计采购金额和累计销售金额数据
      getAction('/bigScreen/totalAmount').then(res => {
        if (res.success) {
          // 更新数据
          this.purchaseAmount = res.result.purchaseAmount || 0
          this.salesAmount = res.result.salesAmount || 0
        } else {
          console.error('获取累计金额数据失败:', res.message)
        }
      }).catch(err => {
        console.error('获取累计金额数据异常:', err)
      })
    },
    // 获取趋势图数据
    fetchTrendData() {
      getAction('/bigScreen/trendData').then(res => {
        if (res.success && res.result) {
          const result = res.result
          
          // 更新趋势数据
          this.trendData.categories = result.categories || []
          this.trendData.purchaseData = result.purchaseData || []
          this.trendData.salesData = result.salesData || []
          
          // 更新时间范围显示
          this.chartDateRange = result.dateRange || '数据加载中...'
          
          // 更新图表配置
          this.updateChartData()
          
          console.log('趋势图数据加载成功:', this.trendData)
        } else {
          console.error('获取趋势图数据失败:', res.message)
          // 使用默认数据作为备用
          this.setDefaultTrendData()
        }
      }).catch(err => {
        console.error('获取趋势图数据异常:', err)
        // 使用默认数据作为备用
        this.setDefaultTrendData()
      })
    },
    // 设置默认趋势数据（备用方案）
    setDefaultTrendData() {
      const currentYear = new Date().getFullYear()
      this.trendData.categories = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      this.trendData.purchaseData = [400, 450, 1600, 1500, 1400, 1300, 1200, 1350, 1450, 1500, 1650, 1550]
      this.trendData.salesData = [800, 750, 2400, 2300, 2200, 2100, 2000, 2150, 2200, 2350, 2450, 2350]
      this.chartDateRange = `${currentYear}.01-${currentYear}.12`
      this.updateChartData()
    },
    // 更新图表数据
    updateChartData() {
      if (this.trendChart) {
        // 更新图表配置，保持完整的系列配置
        const newOption = {
          xAxis: {
            data: this.trendData.categories
          },
          series: [
            {
              name: '采购金额',
              type: 'line',
              smooth: true,
              lineStyle: {
                width: 2,
                color: '#008FFB', // 采购金额线条颜色
              },
              showSymbol: false,
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'rgba(0, 143, 251, 0.35)', // 采购金额区域渐变起始色
                  },
                  {
                    offset: 1,
                    color: 'rgba(0, 143, 251, 0.05)', // 采购金额区域渐变结束色
                  },
                ]),
              },
              emphasis: {
                focus: 'series',
              },
              data: this.trendData.purchaseData
            },
            {
              name: '销售金额',
              type: 'line',
              smooth: true,
              lineStyle: {
                width: 2,
                color: '#FFA500', // 销售金额线条颜色
              },
              showSymbol: false,
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'rgba(255, 165, 0, 0.2)', // 销售金额区域渐变起始色
                  },
                  {
                    offset: 1,
                    color: 'rgba(255, 165, 0, 0.05)', // 销售金额区域渐变结束色
                  },
                ]),
              },
              emphasis: {
                focus: 'series',
              },
              data: this.trendData.salesData
            }
          ]
        }
        
        // 使用 setOption 更新图表数据，设置 notMerge 为 false 以保持原有配置
        this.trendChart.setOption(newOption, false)
      }
    },
    // 刷新所有数据
    refreshData() {
      this.fetchTotalAmount()
      this.fetchTrendData()
    }
  },
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

.chart-section {
  flex: 1; // 占据剩余空间
  display: flex;
  flex-direction: column;
  .chart-title-line{
    flex: 1;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.2); // 调整线条颜色
    margin: 0 10px; // 调整线条左右间距
  }
}

.chart-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-main-title {
  color: #fff;
  display: flex;
  align-items: center;
  .title-decorator {
    width: 30px; // 调整装饰点大小
    height: 30px;
    margin-right: 5px; // 调整装饰点与文字间距
  }
  .chart-main-title-text{
    font-size: 14px;
    color:rgb(122, 204, 255);
    letter-spacing: 2px;
  }
}

.chart-legend {
  display: flex;
  .title-arrow{
    width: 12px;
    animation: blink 2s infinite;
    &:nth-child(2) {
      animation-delay: 0.3s;
    }
  }
}

.trend-chart {
  width: 100%;
  flex: 1; // 图表占据剩余高度
//   min-height: 250px; // 保证图表最小高度
}
</style>
