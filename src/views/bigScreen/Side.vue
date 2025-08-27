<template>
  <div class="bigScreen-side">
    <img class="side-bg" src="../../assets/images/bigScreen/side-bg.png" />
    <img class="side-icon1" src="../../assets/images/bigScreen/side1.svg" />
    <img class="side-icon2" src="../../assets/images/bigScreen/side2.svg" />
    <img class="side-icon3" src="../../assets/images/bigScreen/side3.svg" />
  </div>
</template>
<style lang="less" scoped>
@keyframes moveLeftRight {
  0% {
    right: -4px;
  }
  50% {
    right: 2px;
  }
  100% {
    right: -4px;
  }
}
.bigScreen-side {
  width: 36px;
  height: 100%;
  position: absolute;
  top: 0;
  .side-icon1 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%) rotate(90deg);
    animation: moveLeftRight 1s infinite;
  }
  .side-icon2 {
    position: absolute;
    top: 50%;
    right: 6px;
    width: 26px;
    height: 940px;
    transform: translateY(-50%);
  }
  .side-icon3 {
    position: absolute;
    top: 50%;
    right: 14px;
    width: 23px;
    height: 672px;
    transform: translateY(-328px);
  }
  .side-bg {
    position: absolute;
    top: 50%;
    right: 0;
    width: 180px;
    // height: 921px;
    transform: translateY(-50%);
  }
}
</style>
