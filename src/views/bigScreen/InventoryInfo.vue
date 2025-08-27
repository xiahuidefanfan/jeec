<template>
  <div class="chart-container" ref="inventoryChart"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return {
      chart: null,
      // 示例数据，请替换为您的实际数据
      chartData: {
        categories: ['手机数码', '家装家居', '服装衣帽', '母婴儿童', '智能设备', '办公用品', '生活用品'],
        outbound: [75, 30, 85, 65, 30, 60, 75], // 出库数
        inbound: [35, 15, 45, 25, 75, 25, 55], // 入库数
        remaining: [80, 70, 60, 78, 90, 85, 80], // 剩余库存
      },
    }
  },
  mounted() {
    this.initChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.inventoryChart)
      const option = {
        backgroundColor: 'transparent', // 设置背景透明，以便显示父容器的深色背景
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999',
            },
          },
        },
        legend: {
          data: ['出库数', '入库数', '剩余库存'],
          top: 0,
          right: 10,
          textStyle: {
            color: 'rgba(255, 255, 255, 0.8)', // 图例文字颜色
          },
        },
        grid: {
          top: 40,
          left: 20,
          right: 20,
          bottom: 10,
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            data: this.chartData.categories,
            axisLabel: {
              interval: 0,
              fontFamily: 'PingFang SC-Regular',
              fontSize: 12,
              color: '#ffffff',
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '数量',
            min: 0,
            max: 100, // 根据您的数据范围调整
            interval: 10, // 根据您的数据范围调整
            nameTextStyle: {
              color: '#ffffff',
              padding: [0, 0, 5, 5],
              fontFamily: 'PingFang SC-Regular',
              fontSize: 12,
            },
            splitLine: {
              lineStyle: {
                color: ['rgba(255,255,255,0.4)'],
                type: 'dashed',
                width: 0.5,
              },
            },
            axisLabel: {
              // padding: [0, 0, 0, 20],
              color: '#ffffff',
              fontFamily: 'PingFang SC-Regular',
              fontSize: 12,
            },
          },
        ],
        series: [
          {
            name: '出库数',
            type: 'bar',
            barWidth: 10,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 件'
              },
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255,183,77,0.8)' }, // 浅橙色
                { offset: 1, color: 'rgba(255,183,77,0.1)' }, // 橙色
              ]),
            },
            data: this.chartData.outbound,
          },
          {
            name: '入库数',
            type: 'line',
            smooth: true,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 件'
              },
            },
            lineStyle: {
              width: 2,
              color: '#4FC3F7', // 调整后的亮蓝色
            },
            itemStyle: {
              color: '#4FC3F7', // 标记点颜色与线条一致
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(79, 195, 247, 0.6)' }, // 调整后的亮蓝色渐变
                { offset: 1, color: 'rgba(79, 195, 247, 0.1)' },
              ]),
            },
            symbol:
              'image://data:image/png;base64,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', // 折线图点的形状
            symbolSize: 24, // 折线图点的大小，根据图片调整
            data: this.chartData.inbound,
          },
          {
            name: '剩余库存',
            type: 'line',
            smooth: true,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' 件'
              },
            },
            lineStyle: {
              width: 2,
              color: '#AED571', // 浅白色/淡蓝色
            },
            itemStyle: {
              // 为方形symbol添加渐变色
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                // 水平渐变
                { offset: 0, color: '#AED581' }, // 浅绿色
                { offset: 1, color: '#9CCC65' }, //稍深的绿色
              ]),
              borderColor: '#fff',
              borderWidth: 1,
            },
            symbol: 'rect', // 折线图点的形状，方形
            symbolSize: 10, // 折线图点的大小
            data: this.chartData.remaining,
          },
        ],
      }
      this.chart.setOption(option)
    },
    handleResize() {
      if (this.chart) {
        this.chart.resize()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.chart-container {
  width: 100%;
  height: 100%;
  // 如果您的父容器有深色背景，这里可以不用设置背景色
  // background-color: #0f1c39; // 示例深色背景
}
</style>
