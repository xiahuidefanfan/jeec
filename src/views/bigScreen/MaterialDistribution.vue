<template>
  <div id="materialDistribution" class="material-distribution"></div>
</template>

<script>
import * as echarts from 'echarts'
const barWidth = 20
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      myChart: null,
      startIndex: 0, // 新增：当前显示柱子的起始索引
      timer: null, // 新增：定时器变量
      option: {
        grid: {
          top: 40,
          left: 20,
          right: 20,
          bottom: 10,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          axisTick: {
            show: false,
          },
          data: [],
          axisLabel: {
            interval: 0,
            fontFamily: 'PingFang SC-Regular',
            fontSize: 12,
            color: '#ffffff',
          },
          axisLine: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          name: `单位/个`,
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
        series: [
          // 数据的柱状图
          {
            name: '',
            type: 'bar',
            barWidth: barWidth, // 柱条的宽度，不设时自适应。
            data: [],
            itemStyle: {
              color: () => {
                return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(23, 133, 236, 1)' },
                  { offset: 1, color: 'rgba(23, 133, 236, 0.26)' },
                ])
              },
            },
            zLevel: 1,
            z: 1,
          },
          {
            name: '',
            type: 'bar',
            barWidth: barWidth / 2, // 柱条的宽度，不设时自适应。
            barGap: '-50%', // 不同系列的柱间距离
            data: [],
            itemStyle: {
              normal: {
                color: (params) => {
                  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(24, 144, 255, 1)' },
                    { offset: 1, color: 'rgba(24, 144, 255, 0.24)' },
                  ])
                },
                borderWidth: 0.1,
                borderColor: 'transparent',
              },
            },
            zLevel: 2,
            z: 2,
          },
          // 数据顶部的样式
          {
            name: '',
            type: 'pictorialBar',
            symbol: 'diamond',
            symbolSize: [barWidth, barWidth / 2],
            symbolOffset: [0, '-50%'],
            symbolPosition: 'end',
            zLevel: 3,
            z: 3,
            itemStyle: {
              normal: {
                color: (params) => 'rgba(24, 144, 255, 1)',
                label: {
                  show: true, // 开启显示
                  position: 'top', // 在上方显示
                  textStyle: {
                    fontSize: '12',
                    color: '#B0E1FF',
                  },
                },
              },
            },
            data: [],
          },
        ],
      },
    }
  },
  mounted() {
    this.renderChart()
    this.startCarousel() // 新增：启动轮播
  },
  beforeDestroy() {
    clearInterval(this.timer) // 新增：清除定时器
  },
  methods: {
    renderChart() {
      const chartDom = document.getElementById('materialDistribution')
      if (!chartDom) {
        return
      }
      const _xAxisData = []
      const _data = []

      // 根据 startIndex 和显示数量截取数据
      let displayData = []
      const totalLength = this.data.length
      const displayCount = 6

      if (totalLength <= displayCount) {
        // 如果总数据量小于等于显示数量，则直接显示所有数据
        displayData = this.data
      } else {
        // 计算从当前 startIndex 开始到数据末尾的剩余数据量
        const remaining = totalLength - this.startIndex
        if (remaining >= displayCount) {
          // 如果剩余数据足够显示，直接截取
          displayData = this.data.slice(this.startIndex, this.startIndex + displayCount)
        } else {
          // 如果剩余数据不足，则截取剩余部分，并从开头补充
          displayData = this.data.slice(this.startIndex)
          displayData = displayData.concat(this.data.slice(0, displayCount - remaining))
        }
      }

      displayData.forEach((d) => {
        _xAxisData.push(d.name)
        _data.push(d.value)
      })

      this.option.xAxis.data = _xAxisData
      this.option.series.forEach((serie) => {
        if (serie.type === 'pictorialBar') {
          serie.data = _data.map((d) => {
            return {
              value: d,
              symbolOffset: [0, '-50%'],
            }
          })
          return
        }
        serie.data = _data
      })
      if (!this.myChart) {
        this.myChart = echarts.init(chartDom)
      }
      this.myChart.setOption(this.option)
    },
    startCarousel() {
      // 新增：启动轮播方法
      this.timer = setInterval(() => {
        const totalLength = this.data.length
        if (totalLength === 0) return // 避免数据为空时报错

        // 更新 startIndex，实现循环
        this.startIndex = (this.startIndex + 1) % totalLength

        this.renderChart()
      }, 5000)
    },
  },
}
</script>
<style lang="less" scoped>
.material-distribution {
  width: 100%;
  height: 100%;
}
</style>
