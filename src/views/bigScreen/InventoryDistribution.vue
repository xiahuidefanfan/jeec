<template>
  <div ref="chart" style="width: 100%; height: 100%"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'InventoryDistribution',
  data() {
    return {
      chart: null,
    }
  },
  mounted() {
    this.initChart()
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$refs.chart)
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
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
            data: ['华东', '华北', '华南', '华西', '苏皖', '淮南', '淮北', '东北', '闽南', '闽北'],
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
            name: '单位',
            nameTextStyle: {
              color: '#fff',
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
            name: '库存分布',
            type: 'bar',
            barWidth: 10,
            data: [4600, 2950, 5230, 5860, 3654, 1320, 2200, 1090, 980, 886],
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(30,144,255,1)' }, // 亮蓝色
                { offset: 1, color: 'rgba(30,144,255,0.05)' }, // 道奇蓝
              ]),
            },
            label: {
              show: true,
              position: 'top',
              color: '#FFA500', // 柱子上方文字颜色 - 橙色
              formatter: '{c}',
            },
          },
        ],
      }
      this.chart.setOption(option)
    },
  },
}
</script>

<style lang="less" scoped>
/* 您可以在这里添加自定义样式 */
</style>
