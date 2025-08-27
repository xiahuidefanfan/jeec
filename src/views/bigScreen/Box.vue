<template>
  <div class="bigScreen-box">
    <div class="bigScreen-header">
      <img class="bigScreen-header-bg" src="../../assets/images/bigScreen/box-header-bg.png" />
      <img class="bigScreen-header-icon" src="../../assets/images/bigScreen/box-header-icon.png" />
      <img class="bigScreen-header-icon1" src="../../assets/images/bigScreen/box-header-icon1.svg" />
      <img class="bigScreen-header-icon2" src="../../assets/images/bigScreen/box-header-icon2.svg" />
      <img class="bigScreen-header-icon3" src="../../assets/images/bigScreen/box-header-icon3.svg" />
      <span class="bigScreen-box-title">{{ title }}</span>
    </div>
    <div class="bigScreen-box-body" :style="{ height: height + 'px' }">
      <img class="bigScreen-body-icon" src="../../assets/images/bigScreen/box-body-top-left.png" />
      <img class="bigScreen-body-icon" src="../../assets/images/bigScreen/box-body-top-right.png" />
      <img class="bigScreen-body-icon" src="../../assets/images/bigScreen/box-body-bottom-left.png" />
      <img class="bigScreen-body-icon" src="../../assets/images/bigScreen/box-body-bottom-right.png" />
      <img class="bigScreen-body-border" src="../../assets/images/bigScreen/box-body-bottom-border.png" />
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: 200,
    },
  },
  data() {
    return {}
  },
  methods: {},
}
</script>
<style lang="less" scoped>
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
.bigScreen-box {
  & + .bigScreen-box {
    margin-top: 30px;
  }
}
.bigScreen-header {
  position: relative;
  width: 565px;
  height: 50px;
  .bigScreen-header-bg {
    height: 50px;
    position: absolute;
  }
  .bigScreen-box-title {
    margin-left: 40px;
    font-family: bigScreen-title;
    font-size: 24px;
    color: rgb(255, 255, 255);
    letter-spacing: 4px;
    line-height: 50px;
    text-align: left;
    width: 100%;
    font-weight: normal;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    filter: drop-shadow(rgb(0, 117, 255) 0px 0px 8px);
  }
  .bigScreen-header-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 0;
    height: 20px;
  }
  .bigScreen-header-icon1 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 45px;
    width: 2px;
    height: 2px;
    animation: blink 1.5s ease-in-out infinite;
  }
  .bigScreen-header-icon2 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 35px;
    width: 2px;
    height: 2px;
    animation: blink 1.5s ease-in-out infinite;
  }
  .bigScreen-header-icon3 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 25px;
    width: 2px;
    height: 2px;
    animation: blink 1.5s ease-in-out infinite;
  }
}
.bigScreen-box-body {
  margin-top: 10px;
  position: relative;
  height: 200px;
  width: 570px;
  .bigScreen-body-icon {
    position: absolute;
    width: 8px;
    height: 8px;
    animation: blink 1.5s ease-in-out infinite;
    &:nth-child(1) {
      top: 0;
      left: 0;
    }
    &:nth-child(2) {
      top: 0;
      right: 0;
    }
    &:nth-child(3) {
      bottom: 0;
      left: 0;
    }
    &:nth-child(4) {
      bottom: 0;
      right: 0;
    }
  }
  .bigScreen-body-border {
    position: absolute;
    width: 90%;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
