<template>
  <div class="bigScreen-footer">
    <img class="footer-icon1" src="../../assets/images/bigScreen/footer-icon1.svg" alt="" />
    <img class="footer-icon2" src="../../assets/images/bigScreen/footer-icon2.svg" alt="" />
    <img class="footer-icon3" src="../../assets/images/bigScreen/footer-icon3.svg" alt="" />
    <img class="footer-icon4" src="../../assets/images/bigScreen/footer-icon4.svg" alt="" />
    <img class="footer-icon5" src="../../assets/images/bigScreen/footer-icon5.svg" alt="" />
    <img class="footer-icon6" src="../../assets/images/bigScreen/footer-icon6.svg" alt="" />
  </div>
</template>
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
@keyframes moveUpDown {
  0%,
  100% {
    top: -2px;
  }
  50% {
    top: -8px;
  }
}
.bigScreen-footer {
  position: absolute;
  left: 50%;
  bottom: -54px;
  transform: translateX(-50%);
  width: 1595px;
  height: 135px;
  background-image: url('../../assets/images/bigScreen/footer.png');
  background-size: 100% 100%;
  .footer-icon1 {
    position: absolute;
    left: 50%;
    top: 50px;
    width: 36px;
    height: 13px;
    transform: translateX(-180px);
    animation: blink 1.5s ease-in-out infinite;
  }
  .footer-icon2 {
    position: absolute;
    top: 50px;
    left: 50%;
    width: 36px;
    height: 13px;
    transform: translateX(140px);
    animation: blink 1.5s ease-in-out infinite;
  }
  .footer-icon3 {
    position: absolute;
    // top: -5px;
    left: 50%;
    width: 44px;
    height: 14px;
    transform: translateX(-50%);
    animation: moveUpDown 1.5s ease-in-out infinite;
  }
  .footer-icon4 {
    position: absolute;
    top: 40px;
    left: 50%;
    width: 30px;
    height: 15px;
    transform: translateX(-50%);
    animation: blink 1.5s ease-in-out infinite;
  }
  .footer-icon5 {
    position: absolute;
    top: 52px;
    left: 50%;
    width: 69px;
    height: 16px;
    transform: translateX(-398px);
    animation: blink 2s ease-in-out infinite;
  }
  .footer-icon6 {
    position: absolute;
    top: 52px;
    left: 50%;
    width: 69px;
    height: 16px;
    transform: translateX(334px);
    animation: blink 2s ease-in-out infinite;
  }
}
</style>
