<template>
  <a-card :bordered="false">
    <!-- 项目列表 -->
    <div v-show="!showPorjectDetail">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="物料编名称">
                <a-input placeholder="请输入" v-model="queryParam.name" />
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="物料编编码">
                <a-input placeholder="请输入" v-model="queryParam.code" />
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

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <table-columns-setter v-model="columns" style="float: right" />
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
            <a @click="viewDetail(record)">详情</a>
            <a-divider type="vertical" />
            <a-dropdown>
              <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
              <a-menu slot="overlay">
                <a-menu-item key="1" @click="myHandleEdit(record)"> 编辑 </a-menu-item>
                <a-menu-item key="2">
                  <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">删除</a-popconfirm>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </span>
        </a-table>
      </div>
    </div>
    <!-- 项目详情 -->
    <project-detail
      v-if="showPorjectDetail"
      :project="currentProject"
      @close="showPorjectDetail = false"
    ></project-detail>
    <!-- 项目弹窗 -->
    <project-modal ref="modalForm" @ok="modalFormOk" />
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ProjectModal from './modules/project/ProjectModal'
import TableColumnsSetter from '@/views/erp/common/components/TableColumnsSetter'
import { BillListMixin } from '@/views/erp/common/mixins/BillListMixin'
import { filterDictTextByCache } from '@/components/dict/JDictSelectUtil'
import ProjectDetail from './modules/project/ProjectDetail.vue'

export default {
  name: 'ProjectList',
  mixins: [JeecgListMixin, BillListMixin],
  components: { ProjectModal, TableColumnsSetter, ProjectDetail },

  data() {
    return {
      queryParam: {
        projectNo: '',
        projectName: '',
        customerId: '',
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
          title: '物料编名称',
          align: 'center',
          dataIndex: 'name',
          ellipsis: true,
        },
        {
          title: '物料编编码',
          align: 'center',
          dataIndex: 'code',
          ellipsis: true,
        },
        {
          title: '单位',
          align: 'center',
          dataIndex: 'unit',
          ellipsis: true,
        },
        {
          title: '总库存数量',
          align: 'center',
          dataIndex: 'quantity',
          ellipsis: true,
        },
        {
          title: '纯库存数量',
          align: 'center',
          dataIndex: 'pureQuantity',
          ellipsis: true,
        },
        {
          title: '操作',
          dataIndex: 'action',
          fixed: 'right',
          width: 200,
          align: 'center',
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'action',
          },
        },
      ],
      url: {
        list: '/project/stk/list',
        delete: '/stock/stkIo/delete',
        deleteBatch: '/stock/stkIo/deleteBatch',
        close: '/stock/stkIo/close',
        closeBatch: '/stock/stkIo/closeBatch',
        unclose: '/stock/stkIo/unclose',
        uncloseBatch: '/stock/stkIo/uncloseBatch',
        exportXlsUrl: '/stock/stkIo/exportXls/101/0',
        importExcelUrl: 'stock/stkIo/importExcel/101/0',
      },
      dictOptions: {},
      showPorjectDetail: false,
      currentProject: {},
    }
  },

  created() {},

  methods: {
    initDictConfig() {},
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
</style>
