<template>
  <a-card :bordered="false">
    <!-- 收付列表 -->
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目编号">
              <a-input placeholder="请输入" v-model="queryParam.projectNo" />
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="货单编号">
              <a-input placeholder="请输入" v-model="queryParam.projectName" />
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
          <a @click="handlePayment(record)">新增核销</a>
        </span>
        <p class="table-wrapper" slot="expandedRowRender" slot-scope="record">
          <a-table
            size="middle"
            rowKey="writeOffNo"
            :columns="innerColumns"
            :dataSource="record.writeOffFormEntityList"
            :pagination="false"
          >
            <span slot="action" slot-scope="text, record">
              <a-popconfirm
                :title="`确定删除【${record.writeOffNo}】这条核销记录吗?`"
                @confirm="() => handleDelete(record.id)"
                ><a>删除</a></a-popconfirm
              >
            </span>
          </a-table>
        </p>
      </a-table>
    </div>
    <project-payment ref="projectPaymentRef" @ok="modalFormOk"></project-payment>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import TableColumnsSetter from '@/views/erp/common/components/TableColumnsSetter'
import { BillListMixin } from '@/views/erp/common/mixins/BillListMixin'
import ProjectPayment from './modules/payment/ProjectPayment.vue'

export default {
  name: 'ProjectList',
  mixins: [JeecgListMixin, BillListMixin],
  components: { TableColumnsSetter, ProjectPayment },

  data() {
    return {
      queryParam: {
        projectNo: '',
        disOrderNo: '',
      },

      // 表头
      columns: [
        // {
        //   title: '#',
        //   dataIndex: '',
        //   key: 'rowIndex',
        //   fixed: 'left',
        //   width: 40,
        //   align: 'center',
        //   customRender: (t, r, index) => parseInt(index) + 1,
        // },
        {
          title: '付款单编号',
          align: 'center',
          dataIndex: 'billNo',
          ellipsis: true,
        },
        {
          title: '项目编号',
          align: 'center',
          dataIndex: 'projectNo',
          ellipsis: true,
        },
        {
          title: '订单编号',
          align: 'center',
          dataIndex: 'orderNo',
          ellipsis: true,
        },
        {
          title: '货单编号',
          align: 'center',
          dataIndex: 'disOrderNo',
          ellipsis: true,
        },
        {
          title: '甲方',
          align: 'center',
          dataIndex: 'customerId_dictText',
          ellipsis: true,
        },
        {
          title: '乙方',
          align: 'center',
          dataIndex: 'supplierId_dictText',
          ellipsis: true,
        },
        {
          title: '业务员',
          align: 'center',
          dataIndex: 'businessPerson_dictText',
          width: 130,
          ellipsis: true,
        },
        {
          title: '应付金额',
          align: 'center',
          dataIndex: 'transactionAmount',
          ellipsis: true,
        },
        {
          title: '已核销金额',
          align: 'center',
          dataIndex: 'settlementAmount',
          ellipsis: true,
        },
        {
          title: '制单人',
          align: 'center',
          width: 130,
          dataIndex: 'createBy_dictText',
          ellipsis: true,
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 90,
          align: 'center',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'action',
          },
        },
      ],
      innerColumns: [
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
          title: '单据编号',
          align: 'center',
          dataIndex: 'writeOffNo',
          ellipsis: true,
        },
        {
          title: '付款单编号',
          align: 'center',
          dataIndex: 'billNo',
          ellipsis: true,
        },
        //TODO 待确认
        {
          title: '付款方',
          align: 'center',
          dataIndex: 'customerId_dictText',
          ellipsis: true,
        },
        {
          title: '业务员',
          align: 'center',
          dataIndex: 'createBy_dictText',
          ellipsis: true,
        },
        {
          title: '核销金额',
          align: 'center',
          dataIndex: 'settlementAmount',
          ellipsis: true,
        },
        {
          title: '付款时间',
          align: 'center',
          dataIndex: 'transactionDate',
          ellipsis: true,
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 90,
          align: 'center',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'action',
          },
        },
      ],
      url: {
        list: '/project/projectBill/list',
        delete: '/project/projectWriteOffForm/delete',
      },
      dictOptions: {},
      showPorjectDetail: false,
      currentProject: {},
    }
  },

  created() {},

  methods: {
    initDictConfig() {},
    handlePayment(record) {
      this.$refs.projectPaymentRef.show(record)
    },
    viewDetail(record) {
      this.showPorjectDetail = true
      this.currentProject = record
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@assets/less/common.less';
@import '~@/views/erp/common/less/List.less';
.table-wrapper {
  background-color: #ffffff;
  margin: 0;
}
</style>
