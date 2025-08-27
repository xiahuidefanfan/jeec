<template>
  <div class="chart-container">
    <div class="chart" ref="chart"></div>
    <!-- <div class="base-wrapper">
      <video
        class="base"
        playsinline=""
        x-webkit-airplay="allow"
        x5-playsinline=""
        webkit-playsinline=""
        controlslist="nodownload"
        src="@/assets/images/bigScreen/base.mp4"
      ></video>
    </div> -->
  </div>
</template>

<script>
import * as echarts from 'echarts'
import 'echarts-gl'

export default {
  data() {
    return {
      chart: null,
      // 示例数据，请替换为您的实际数据
      chartData: [
        {
          name: '性能测试',
          value: 134,
        },
        {
          name: '安全',
          value: 56,
        },
        {
          name: '功能',
          value: 57,
        },
        {
          name: '易用性',
          value: 51,
        },
        {
          name: '代码',
          value: 11,
        },
      ],
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
    padEndChinese(str, targetWidth) {
      // 计算当前字符串的显示宽度
      let displayWidth = 0
      for (const char of str) {
        // 检测中文字符（Unicode范围：\u4E00-\u9FA5）
        displayWidth += /[\u4E00-\u9FA5]/.test(char) ? 1 : 1
      }

      // 计算需要填充的空格数量
      const paddingNeeded = targetWidth - displayWidth

      // 填充空格并返回结果
      return paddingNeeded <= 0 ? str : str + '\u3000'.repeat(paddingNeeded)
    },

    getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, h) {
      // 计算
      let midRatio = (startRatio + endRatio) / 2

      let startRadian = startRatio * Math.PI * 2
      let endRadian = endRatio * Math.PI * 2
      let midRadian = midRatio * Math.PI * 2

      // 如果只有一个扇形，则不实现选中效果。
      // if (startRatio === 0 && endRatio === 1) {
      //     isSelected = false;
      // }
      isSelected = false
      // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
      k = typeof k !== 'undefined' ? k : 1 / 3

      // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
      let offsetX = isSelected ? Math.sin(midRadian) * 0.1 : 0
      let offsetY = isSelected ? Math.cos(midRadian) * 0.1 : 0

      // 计算高亮效果的放大比例（未高亮，则比例为 1）
      let hoverRate = isHovered ? 1.05 : 1

      // 返回曲面参数方程
      return {
        u: {
          min: -Math.PI,
          max: Math.PI * 3,
          step: Math.PI / 32,
        },

        v: {
          min: 0,
          max: Math.PI * 2,
          step: Math.PI / 20,
        },

        x: function (u, v) {
          if (u < startRadian) {
            return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
          }
          if (u > endRadian) {
            return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
          }
          return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
        },

        y: function (u, v) {
          if (u < startRadian) {
            return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
          }
          if (u > endRadian) {
            return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
          }
          return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
        },

        z: function (u, v) {
          if (u < -Math.PI * 0.5) {
            return Math.sin(u)
          }
          if (u > Math.PI * 2.5) {
            return Math.sin(u) * h * 0.1
          }
          return Math.sin(v) > 0 ? 1 * h * 0.1 : -1
        },
      }
    },
    getPie3D(pieData, internalDiameterRatio) {
      let series = []
      let sumValue = 0
      let startValue = 0
      let endValue = 0
      let legendData = []
      let k =
        typeof internalDiameterRatio !== 'undefined' ? (1 - internalDiameterRatio) / (1 + internalDiameterRatio) : 1 / 3

      // 为每一个饼图数据，生成一个 series-surface 配置
      for (let i = 0; i < pieData.length; i++) {
        sumValue += pieData[i].value

        let seriesItem = {
          name: typeof pieData[i].name === 'undefined' ? `series${i}` : pieData[i].name,
          type: 'surface',
          parametric: true,
          wireframe: {
            show: false,
          },
          pieData: pieData[i],
          pieStatus: {
            selected: false,
            hovered: false,
            k: 1 / 10,
          },
        }

        if (typeof pieData[i].itemStyle != 'undefined') {
          let itemStyle = {}

          typeof pieData[i].itemStyle.color != 'undefined' ? (itemStyle.color = pieData[i].itemStyle.color) : null
          typeof pieData[i].itemStyle.opacity != 'undefined' ? (itemStyle.opacity = pieData[i].itemStyle.opacity) : null

          seriesItem.itemStyle = itemStyle
        }
        series.push(seriesItem)
      }

      // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
      // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
      for (let i = 0; i < series.length; i++) {
        endValue = startValue + series[i].pieData.value

        series[i].pieData.startRatio = startValue / sumValue
        series[i].pieData.endRatio = endValue / sumValue
        series[i].parametricEquation = this.getParametricEquation(
          series[i].pieData.startRatio,
          series[i].pieData.endRatio,
          false,
          false,
          k,
          series[i].pieData.value
        )

        startValue = endValue

        legendData.push(series[i].name)
      }

      // 补充一个透明的圆环，用于支撑高亮功能的近似实现。
      series.push({
        name: 'mouseoutSeries',
        type: 'surface',
        parametric: true,
        wireframe: {
          show: false,
        },
        itemStyle: {
          opacity: 0.1,
          color: '#E1E8EC',
        },
        parametricEquation: {
          u: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20,
          },
          v: {
            min: 0,
            max: Math.PI,
            step: Math.PI / 20,
          },
          x: function (u, v) {
            return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2
          },
          y: function (u, v) {
            return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2
          },
          z: function (u, v) {
            return Math.cos(v) > 0 ? -0.5 : -5
          },
        },
      })

      // 补充一个透明的圆环，用于支撑高亮功能的近似实现。
      series.push({
        name: 'mouseoutSeries',
        type: 'surface',
        parametric: true,
        wireframe: {
          show: false,
        },
        itemStyle: {
          opacity: 0.1,
          color: '#E1E8EC',
        },
        parametricEquation: {
          u: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20,
          },
          v: {
            min: 0,
            max: Math.PI,
            step: Math.PI / 20,
          },
          x: function (u, v) {
            return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2
          },
          y: function (u, v) {
            return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2
          },
          z: function (u, v) {
            return Math.cos(v) > 0 ? -5 : -7
          },
        },
      })
      series.push({
        name: 'mouseoutSeries',
        type: 'surface',

        parametric: true,
        wireframe: {
          show: false,
        },
        itemStyle: {
          opacity: 0.1,
          color: '#E1E8EC',
        },
        parametricEquation: {
          u: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20,
          },
          v: {
            min: 0,
            max: Math.PI,
            step: Math.PI / 20,
          },
          x: function (u, v) {
            return ((Math.sin(v) * Math.sin(u) + Math.sin(u)) / Math.PI) * 2.2
          },
          y: function (u, v) {
            return ((Math.sin(v) * Math.cos(u) + Math.cos(u)) / Math.PI) * 2.2
          },
          z: function (u, v) {
            return Math.cos(v) > 0 ? -7 : -7
          },
        },
      })

      // 准备待返回的配置项，把准备好的 legendData、series 传入。
      let option = {
        //animation: false,

        legend: {
          right: 5,
          top: 'center',
          orient: 'vertical',
          textStyle: {
            fontSize: 14,
            color: 'rgba(255,255,255,0.7)',
          },
          // icon:'diamond',
          data: legendData,
          formatter: (name) => {
            // 获取当前项数据
            const item = series.find((s) => s.name === name)
            if (!item || !item.pieData) return name
            const value = item.pieData.value
            const percent = ((value / sumValue) * 100).toFixed(1) + '%'
            // const paddedValue = value.toString().padEnd(10, ' ')
            return `${this.padEndChinese(name, 8)}${value}   ${percent.padStart(7, ' ')}`
          },
        },
        tooltip: {
          formatter: (params) => {
            if (params.seriesName !== 'mouseoutSeries') {
              return `${
                params.seriesName
              }<br/><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${
                params.color
              };"></span>${option.series[params.seriesIndex].pieData.value}`
            }
            return ''
          },
        },
        xAxis3D: {},
        yAxis3D: {},
        zAxis3D: {},
        grid3D: {
          viewControl: {
            autoRotate: true,
          },
          top: -30,
          left: -130,
          //   width: 200,
          show: false,
          boxHeight: 70,
          boxWidth: 200,
          boxDepth: 200,
        },

        series: series,
      }
      return option
    },
    initChart() {
      const option = this.getPie3D(this.chartData, 0.7)
      if (this.chart) {
        this.chart.dispose()
      }
      this.chart = echarts.init(this.$refs.chart)
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
  position: relative;
  width: 100%;
  height: 100%;
  .chart {
    width: 100%;
    height: 100%;
  }
  .base-wrapper {
    position: absolute;
    width: 391px;
    height: 152px;
    left: 0;
    top: 0;
    mix-blend-mode: screen;
    object-fit: fill;
    opacity: 0.9;
    transform: rotateX(0deg) rotateY(0deg) rotateZ(90deg) scaleX(1) scaleY(1) translate3d(0px, 0px, 0px);
    filter: hue-rotate(338deg);
    .base {
      width: 100%;
      height: 100%;
      object-fit: fill;
      opacity: 0.9;
      transform: rotateX(0deg) rotateY(0deg) rotateZ(90deg) scaleX(1) scaleY(1) translate3d(0px, 0px, 0px);
      filter: hue-rotate(338deg);
    }
  }
}
</style>
