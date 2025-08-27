<template>
  <div class="dashboard-header">
    <img class="header-cover" src="../../assets/images/bigScreen/header-bg.png" alt="" />
    <img class="header-bg" src="../../assets/images/bigScreen/header.png" alt="" />
    <h1>进销存数据大屏</h1>
    <div class="dashboard-time">{{ currentTime }}</div>
    <img class="header-icon1" src="../../assets/images/bigScreen/side1.svg" alt="" />
    <div class="wave">
      <img class="wave-item" src="../../assets/images/bigScreen/header-icon1.png" alt="" />
      <img class="wave-item" src="../../assets/images/bigScreen/header-icon1.png" alt="" />
      <img class="wave-item" src="../../assets/images/bigScreen/header-icon1.png" alt="" />
    </div>
    <div class="wave wave2">
      <img class="wave-item" src="../../assets/images/bigScreen/header-icon1.png" alt="" />
      <img class="wave-item" src="../../assets/images/bigScreen/header-icon1.png" alt="" />
      <img class="wave-item" src="../../assets/images/bigScreen/header-icon1.png" alt="" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'BigScreenHeader',
  components: {},
  data() {
    return {
      currentTime: '',
    }
  },
  mounted() {
    setInterval(this.updateTime, 1000)
  },
  methods: {
    updateTime() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      this.currentTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
  },
}
</script>

<style scoped lang="less">
@keyframes moveUpDown {
  0%,
  100% {
    top: 230px;
  }
  50% {
    top: 240px;
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
}

.dashboard-header {
  position: absolute;
  left: -30px;
  top: -130px;
  width: 1966px;
  height: 360px;
  pointer-events: none;
  .header-cover {
    top: 100px;
    position: absolute;
    width: 100%;
  }
  .header-bg {
    width: 100%;
    height: 100%;
  }
  h1 {
    margin-top: -10px;
    position: absolute;
    top: 50%;
    left: 50%;
    font-family: bigScreen-title;
    font-size: 42px;
    color: rgb(255, 255, 255);
    letter-spacing: 5px;
    line-height: 48px;
    text-align: center;
    width: 100%;
    font-weight: normal;
    transform: translate(-50%, -50%);
    filter: drop-shadow(rgb(0, 117, 255) 0px 0px 8px);
  }
  .dashboard-time {
    position: absolute;
    text-align: center;
    right: 10px;
    top: 220px;
    width: 422px;
    height: 30px;
    font-family: bigScreen-time;
    font-size: 24px;
    color: rgb(230, 247, 255);
    letter-spacing: 2px;
    font-weight: normal;
    text-shadow: rgb(2, 112, 255) 0px 0px 10px;
  }
  .header-icon1 {
    position: absolute;
    top: 230px;
    left: 50%;
    transform: translateX(-50%);
    animation: moveUpDown 1.5s ease-in-out infinite;
  }
  .wave {
    position: absolute;
    top: 160px;
    left: 50%;
    transform: translateX(-340px);
    .wave-item {
      height: 20px;
      animation: blink 1.5s infinite;
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      &:nth-child(1) {
        animation-delay: 0.4s;
      }
    }
  }
  .wave2 {
    position: absolute;
    top: 160px;
    left: 50%;
    transform: translateX(230px) rotateY(180deg);
  }
}
</style>
