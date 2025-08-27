<template>
  <div class="project-detail">
    <div class="project-detail-header">
      <div class="project-name">{{ project.projectName }} - {{ project.projectNo }}</div>
      <a-icon type="close" @click="$emit('close')" />
    </div>
    <div class="project-detail-menu">
      <div class="project-detail-menu-wrapper">
        <template v-for="(item, index) in projectDetailMenu">
          <div
            @click="changeMenu(item)"
            :key="item.key"
            :class="['project-detail-menu-item', item.key === activeMenu ? 'active-menu' : '']"
          >
            <a-badge :count="item.todo">
              <div class="menu-item-name">
                {{ item.title }}
              </div>
            </a-badge>
          </div>
          <div class="arrow-wrapper" v-if="index != projectDetailMenu.length - 1">
            <a-icon :style="{ color: '#aaaaaa' }" type="right" />
          </div>
        </template>
      </div>
    </div>
    <div class="project-detail-body">
      <price-inquiry v-show="activeMenu === 1" ref="priceInquiry" key="priceInquiry" :projectNo="project.projectNo" />
      <project-quotation
        v-show="activeMenu === 2"
        ref="projectQuotation"
        key="projectQuotation"
        :projectNo="project.projectNo"
      />
      <project-contract
        v-show="activeMenu === 3"
        ref="projectContract"
        key="projectContract"
        :projectNo="project.projectNo"
      />
      <project-order v-show="activeMenu === 4" ref="projectOrder" key="projectOrder" :projectNo="project.projectNo" />
      <project-archive
        v-show="activeMenu === 5"
        ref="projectArchive"
        key="projectArchive"
        :project="project"
      />
    </div>
  </div>
</template>

<script>
import PriceInquiry from './PriceInquiry.vue'
import ProjectQuotation from './ProjectQuotation.vue'
import ProjectContract from './ProjectContract.vue'
import ProjectOrder from './ProjectOrder.vue'
import { getAction } from '@/api/manage'
import ProjectArchive from '@/views/project/modules/project/ProjectArchive.vue'
const projectDetailMenu = [
  {
    title: '发起询价',
    key: 1,
    todo: 10,
  },
  {
    title: '我方报价',
    key: 2,
    todo: 5,
  },
  {
    title: '拟定合同',
    key: 3,
    todo: 0,
  },
  {
    title: '销售订单',
    key: 4,
    todo: 0,
  },
  {
    title: '质保归档',
    key: 5,
    todo: 0,
  },
]
export default {
  name: 'ProjectDetail',
  components: { ProjectArchive, ProjectQuotation, PriceInquiry, ProjectContract, ProjectOrder},
  provide() {
    return {
      materialData: this.materialData,
    }
  },
  props: {
    project: Object,
  },
  data() {
    return {
      projectDetailMenu,
      activeMenu: 1,
      materialData: [],
    }
  },
  methods: {
    changeMenu(menu) {
      this.activeMenu = menu.key
      this.$nextTick(() => {
        switch (menu.key) {
          case 1:
            break
          case 2:
            this.$refs.projectQuotation.initMaterialRelated(this.materialData)
            this.$refs.projectQuotation.refreshTable()
            break
          case 3:
            this.$refs.projectContract.initMaterialRelated(this.materialData)
            this.$refs.projectContract.refreshTable()
            break
          case 4:
            this.$refs.projectOrder.initMaterialRelated(this.materialData)
            this.$refs.projectOrder.refreshTable()
            break
        }
      })
    },
    createQuotation(key, record) {
      this.changeMenu({ key })
      this.$refs.projectQuotation.createQuotation(record)
    },
    createContract(key, record) {
      this.changeMenu({ key })
      this.$refs.projectContract.createContract(record)
    },
    createOrder(key, record) {
      this.changeMenu({ key })
      this.$refs.projectOrder.createOrder(record)
    },
    initMaterialRelated() {
      getAction('/base/basMaterial/list', { pageNo: 1, pageSize: 9999 }).then((res) => {
        let { result } = res
        this.materialData.length = 0
        this.materialData.push(...result.records)
        this.$refs.priceInquiry.initMaterialRelated(result.records)
      })
    },
  },
  created() {
    this.initMaterialRelated()
  },
}
</script>

<style scoped lang="less">
@import '~ant-design-vue/dist/antd.less';
.project-detail {
  background-color: #ffffff;
  .project-detail-header {
    display: flex;
    height: 40px;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid @border-color-base;
    .project-name {
      font-size: 16px;
      font-weight: 600;
    }
  }
  .project-detail-menu {
    margin-top: 8px;
    margin-bottom: 7px;
    display: flex;
    align-items: center;
    height: 50px;
    .project-detail-menu-wrapper {
      width: 100%;
      display: flex;
      align-items: center;
      height: 40px;
      box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      .arrow-wrapper {
        padding: 0 60px;
      }
      .project-detail-menu-item {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        flex: 1;
        cursor: pointer;
        .menu-item-name {
          padding: 10px 20px;
        }
      }
      .active-menu {
        position: relative;
        height: 44px;
        background-color: @primary-color;
        border-radius: 4px;
        color: #ffffff;
        box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.1);
        &::after {
          position: absolute;
          left: 50%;
          bottom: 0;
          content: '';
          width: 0;
          height: 0;
          border-right: 10px solid transparent;
          border-left: 10px solid transparent;
          border-bottom: 10px solid @primary-color;
          transform: translate(-50%, 10px);
        }
      }
    }
  }
  .project-detail-body {
    padding: 8px;
    border: 1px solid @primary-color;
  }
}
</style>
