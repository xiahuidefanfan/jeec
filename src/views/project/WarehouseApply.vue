<template>
  <a-card :bordered="false">
    <!-- 仓库申请列表 -->
    
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="申请编号">
              <a-input placeholder="请输入申请编号" v-model="queryParam.applyNo" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="来源号">
              <a-input placeholder="请输入来源号" v-model="queryParam.sourceNo" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="审核状态">
              <j-dict-select-tag
                v-model="queryParam.reviewState"
                dictCode="review_state"
                placeholder="请选择审核状态"
              />
            </a-form-item>
          </a-col>

          <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
            <a-col :xl="4" :lg="6" :md="7" :sm="24">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </a-col>
          </span>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- table区域-begin -->
    <div>
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          :components="drag(columns)"
          @change="handleTableChange"
        >
          <span slot="action" slot-scope="text, record">
            <a @click="approve(record)" v-show="record.reviewState == 1">审批</a>
            <a-divider v-show="record.reviewState == 1" type="vertical" />
            <a @click="approve(record)">详情</a>
          </span>
        </a-table>
    </div>
    <apply-order-goods ref="applyOrderGoodsRef" @ok="loadData"></apply-order-goods>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ProjectModal from './modules/project/ProjectModal'
import TableColumnsSetter from '@/views/erp/common/components/TableColumnsSetter'
import { BillListMixin } from '@/views/erp/common/mixins/BillListMixin'
import ProjectDetail from './modules/project/ProjectDetail.vue'
import ApplyOrderGoods from "@/views/project/modules/apply/ApplyOrderGoods.vue";

export default {
  name: 'ProjectList',
  mixins: [JeecgListMixin, BillListMixin],
  components: {ApplyOrderGoods, ProjectModal, TableColumnsSetter, ProjectDetail },

  data() {
    return {
      queryParam: {
        applyNo: '',
        sourceNo: '',
        reviewState: '',
      },
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          fixed: 'left',
          width: 40,
          align: 'center',
          customRender: (t, r, index) => parseInt(index) + 1,
        },
        {
          title: '申请编号',
          align: 'center',
          dataIndex: 'applyNo',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '业务类型',
          align: 'center',
          dataIndex: 'businessType_dictText',
          ellipsis: true,
        },
        {
          title: '申请类型',
          align: 'center',
          dataIndex: 'applyType_dictText',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '来源号',
          align: 'center',
          dataIndex: 'sourceNo',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '申请人',
          align: 'center',
          dataIndex: 'applyPerson_dictText',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '审核状态',
          align: 'center',
          dataIndex: 'reviewState_dictText',
          ellipsis: true,
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 120,
          align: 'center',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'action',
          },
        },
      ],
      url: {
        list: '/project/warehouseApply/list',
      },
      dictOptions: {},
    }
  },

  created() {},

  methods: {
    initDictConfig() {},
    approve(record, type) {
      this.$refs.applyOrderGoodsRef.show(record.sourceNo, type, type === 'return' ? 'return' : 'add')
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@assets/less/common.less';
@import '~@/views/erp/common/less/List.less';
</style>
