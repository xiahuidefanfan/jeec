<template>
  <div class="project-detail">
    <div class="project-detail-header">
      <div class="project-name">{{ project.projectName }} - 采购申请</div>
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
      <purchase-apply
        v-show="activeMenu === 0"
        ref="purchaseApply"
        key="purchaseApply"
        :projectNo="project.projectNo"
      ></purchase-apply>
      <purchase-inquiry
        v-show="activeMenu === 1"
        ref="purchaseInquiry"
        key="purchaseInquiry"
        :projectNo="project.projectNo"
      />
      <purchase-quotation
        v-show="activeMenu === 2"
        ref="purchaseQuotation"
        key="purchaseQuotation"
        :projectNo="project.projectNo"
      />
      <purchase-contract
        v-show="activeMenu === 3"
        ref="purchaseContract"
        key="purchaseContract"
        :projectNo="project.projectNo"
      />
      <purchase-order
        v-show="activeMenu === 4"
        ref="purchaseOrder"
        key="purchaseOrder"
        :projectNo="project.projectNo"
      />
      <purchase-archive
        v-show="activeMenu === 5"
        ref="purchaseArchive"
        key="purchaseArchive"
        :project="project"
      />
    </div>
  </div>
</template>

<script>
import PurchaseInquiry from './PurchaseInquiry.vue'
import PurchaseApply from './PurchaseApply.vue'
import PurchaseQuotation from './PurchaseQuotation.vue'
import PurchaseContract from './PurchaseContract.vue'
import PurchaseOrder from './PurchaseOrder.vue'
import PurchaseArchive from './PurchaseArchive.vue'
import PurchaseDetail from './PurchaseDetail.vue'
import { getAction } from '@/api/manage'
const projectDetailMenu = [
  {
    title: '采购申请',
    key: 0,
    todo: 0,
  },
  {
    title: '采购询价',
    key: 1,
    todo: 10,
  },
  {
    title: '供应商报价',
    key: 2,
    todo: 5,
  },
  {
    title: '采购合同',
    key: 3,
    todo: 0,
  },
  {
    title: '采购订单',
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
  components: { PurchaseQuotation, PurchaseInquiry, PurchaseContract, PurchaseOrder, PurchaseApply, PurchaseArchive, PurchaseDetail },
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
      activeMenu: 0,
      materialData: [],
    }
  },
  methods: {
    changeMenu(menu) {
      this.activeMenu = menu.key
      this.$nextTick(() => {
        switch (menu.key) {
          case 1:
            this.$refs.purchaseInquiry.initMaterialRelated(this.materialData)
            this.$refs.purchaseInquiry.refreshTable()
            break
          case 2:
            this.$refs.purchaseQuotation.initMaterialRelated(this.materialData)
            this.$refs.purchaseQuotation.refreshTable()
            break
          case 3:
            this.$refs.purchaseContract.initMaterialRelated(this.materialData)
            this.$refs.purchaseContract.refreshTable()
            break
          case 4:
            this.$refs.purchaseOrder.initMaterialRelated(this.materialData)
            this.$refs.purchaseOrder.refreshTable()
            break
          case 5:
            this.$refs.purchaseDetail.initMaterialRelated(this.materialData)
            break
        }
      })
    },
    createInquery(key, record) {
      this.changeMenu({ key })
      this.$refs.purchaseInquiry.createInquiry(record)
    },
    createQuotation(key, record) {
      this.changeMenu({ key })
      this.$refs.purchaseQuotation.createQuotation(record)
    },
    createContract(key, record) {
      this.changeMenu({ key })
      this.$refs.purchaseContract.createContract(record)
    },
    createOrder(key, record) {
      this.changeMenu({ key })
      this.$refs.purchaseOrder.createOrder(record)
    },
    initMaterialRelated() {
      getAction('/base/basMaterial/list', { pageNo: 1, pageSize: 9999 }).then((res) => {
        let { result } = res
        this.materialData.length = 0
        this.materialData.push(...result.records)
        this.$refs.purchaseApply.initMaterialRelated(result.records)
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
