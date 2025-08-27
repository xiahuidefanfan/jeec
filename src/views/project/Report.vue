<template>
  <div class="project-module">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="项目">
              <a-select
                placeholder="请选择项目"
                v-model="queryParam.projectId"
                allowClear
                showSearch
                optionFilterProp="children"
                @focus="loadProjectList"
                @change="onProjectChange"
              >
                <a-select-option v-for="item in projectList" :key="item.id" :value="item.id">
                  {{ item.projectName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="合同">
              <a-select placeholder="请选择合同" v-model="queryParam.contractNo" allowClear>
                <a-select-option v-for="item in contractList" :key="item.contractNo" :value="item.contractNo">
                  {{ item.contractName ? `${item.contractNo} - ${item.contractName}` : item.contractNo }}
                </a-select-option>
              </a-select>
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
      :scroll="{ x: 2500, y: 500 }"
      :customRow="customRow"
      @change="handleTableChange"
    >
      <a-radio
        slot-scope="text, record"
        slot="select"
        :checked="record.id === model.id"
        @click="myHandleDetail(record)"
      ></a-radio>
      <span slot="action" slot-scope="text, record">
        <a-button
          v-if="record.status === 'create'"
          @click="handleDelete(record.id)"
          type="link"
          icon="delete"
        >删除</a-button>
      </span>
    </a-table>

  </div>
</template>

<style lang="less" scoped>
@import '~@assets/less/common.less';
@import '~@/views/erp/common/less/List.less';

.project-module {
  .ant-btn {
    margin-bottom: 12px;
  }
}
</style>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import ATableDragResize from '@/views/erp/common/mixins/ATableDragResize.js'
import ProjectModuleMixin from '../project/modules/ProjectModuleMixin.js'
import { postAction, deleteAction, getAction } from '@/api/manage'
import XEUtils from 'xe-utils'

export default {
  name: 'Report',
  mixins: [JeecgListMixin, ATableDragResize, ProjectModuleMixin],
  data() {
    return {
      // 禁用JeecgListMixin的自动加载
      disableMixinCreated: true,
      // 表头
      columns: [
        {
          title: '',
          dataIndex: 'select',
          width: 40,
          align: 'center',
          fixed: 'left',
          scopedSlots: { customRender: 'select' },
        },
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 40,
          align: 'center',
          fixed: 'left',
          customRender: (t, r, index) => parseInt(index) + 1,
        },
        {
          title: '客户',
          align: 'center',
          dataIndex: 'customerIdDictText',
          width: 120,
          fixed: 'left',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
        {
          title: '合同号',
          align: 'center',
          dataIndex: 'contractNo',
          width: 140,
          fixed: 'left',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
        {
          title: '合同金额（含税）',
          align: 'center',
          dataIndex: 'taxIncludedAmount',
          width: 140,
          fixed: 'left',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
        {
          title: '签订时间',
          align: 'center',
          dataIndex: 'signDate',
          width: 120,
          fixed: 'left',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
        {
          title: '名称',
          align: 'center',
          dataIndex: 'materialName',
          ellipsis: true,
        },
        {
          title: '客户物料码',
          align: 'center',
          dataIndex: 'customerMaterialCode',
          ellipsis: true,
        },
        {
          title: '订货号',
          align: 'center',
          dataIndex: 'orderNumber',
          ellipsis: true,
        },
        {
          title: '进价（未税）',
          align: 'center',
          width: 120,
          dataIndex: 'purchasePriceExcludeTax',
          ellipsis: true,
        },
        {
          title: '进总（未税）',
          align: 'center',
          width: 120,
          dataIndex: 'purchaseTotalExcludeTax',
          ellipsis: true,
        },
        {
          title: '销价（未税）',
          align: 'center',
          width: 120,
          dataIndex: 'salePriceExcludeTax',
          ellipsis: true,
        },
        {
          title: '销总（未税）',
          align: 'center',
          width: 120,
          dataIndex: 'saleTotalExcludeTax',
          ellipsis: true,
        },
        {
          title: '毛利',
          align: 'center',
          dataIndex: 'grossProfit',
          ellipsis: true,
        },
        {
          title: '总数',
          align: 'center',
          dataIndex: 'total',
          ellipsis: true,
        },
        {
          title: '发货数量',
          align: 'center',
          dataIndex: 'deliveryQuantity',
          ellipsis: true,
        },
        {
          title: '合计（未税）',
          align: 'center',
          width: 120,
          dataIndex: 'totalExcludeTax',
          ellipsis: true,
        },
        {
          title: '合计（含税）',
          align: 'center',
          width: 120,
          dataIndex: 'totalIncludeTax',
          ellipsis: true,
        },
        {
            title: '回款（元）',
            align: 'center',
            dataIndex: 'paymentReceived',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
        {
          title: '付款（元）',
          align: 'center',
          dataIndex: 'payment',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
        {
          title: '交期',
          align: 'center',
          width: 120,
          dataIndex: 'deliveryDate',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
        {
          title: '应付时间',
          align: 'center',
          dataIndex: 'paymentDueDate',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
        {
          title: '开票状态',
          align: 'center',
          dataIndex: 'invoiceStatus',
          ellipsis: true,
          customRender: (text, record, index) => {
            const obj = {
              children: text,
              attrs: {},
            }
            // 计算合并的行数
            const sameContractRows = this.getSameContractRowSpan(index, 'contractNo')
            if (sameContractRows.rowSpan > 0) {
              obj.attrs.rowSpan = sameContractRows.rowSpan
            } else {
              obj.attrs.rowSpan = 0
            }
            return obj
          },
        },
      ],
      url: {
        list: '/project/report',
      },
      queryParam: {
        contractNo: '',
        projectId: '',
      },
      projectList: [],
      contractList: [],
      validatorRules: {
        customerId: [{ required: true, message: '请选择客户' }],
        purchaseOrderNo: [{ required: true, message: '请输入采购单号' }],
        contractNo: [{ required: true, message: '请输入合同编号' }],
        paymentMethod: [{ required: true, message: '请选择付款方式' }],
        month: [{ required: true, message: '请选择月份' }],
        purchaser: [{ required: true, message: '请输入采购员' }],
        signDate: [{ required: true, message: '请选择签订时间' }]
      },
      model: {
        id: '',
        customerId: '',
        purchaseOrderNo: '',
        contractNo: '',
        paymentMethod: '',
        month: '',
        status: 'create',
        materialDetailList: [],
        purchaser: '',
        signDate: '',
        serialNumber: '',
        customerMaterialCode: '',
        materialName: '',
        orderNumber: '',
        purchasePriceExcludeTax: 0,
        purchaseTotalExcludeTax: 0,
        salePriceExcludeTax: 0,
        salePriceIncludeTax: 0,
        grossProfit: 0,
        totalMeters: 0,
        deliveryQuantity: 0,
        totalExcludeTax: 0,
        totalIncludeTax: 0,
        deliveryDate: '',
        invoiceStatus: '',
        paymentReceived: 0,
        paymentDueDate: '',
        paymentStatus: '',
        remark: ''
      },
      materialTable: {
        loading: false,
        rowCount: 0,
        selectedRowCount: 0,
        columns: [
          {
            title: '客户物料码',
            key: 'customerMaterialCode',
            type: JVXETypes.input,
            width: '120px',
            align: 'center',
            placeholder: '请输入',
            defaultValue: '',
          },
          {
            title: '名称',
            key: 'materialName',
            type: JVXETypes.input,
            width: '120px',
            align: 'center',
            placeholder: '请输入',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '订货号',
            key: 'orderNumber',
            type: JVXETypes.input,
            width: '120px',
            align: 'center',
            placeholder: '请输入',
            defaultValue: '',
          },
          {
            title: '进价（未税）',
            key: 'purchasePriceExcludeTax',
            type: JVXETypes.inputNumber,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: 0,
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '进总（未税）',
            key: 'purchaseTotalExcludeTax',
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
          },
          {
            title: '销价（未税）',
            key: 'salePriceExcludeTax',
            type: JVXETypes.inputNumber,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: 0,
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '销价（含税）',
            key: 'salePriceIncludeTax',
            type: JVXETypes.inputNumber,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: 0,
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '毛利',
            key: 'grossProfit',
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
          },
          {
            title: '总数（米）',
            key: 'totalMeters',
            type: JVXETypes.inputNumber,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: 0,
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '发货数量',
            key: 'deliveryQuantity',
            type: JVXETypes.inputNumber,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: 0,
          },
          {
            title: '合计（未税）',
            key: 'totalExcludeTax',
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
          },
          {
            title: '合计（含税）',
            key: 'totalIncludeTax',
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
          },
          {
            title: '交期',
            key: 'deliveryDate',
            type: JVXETypes.date,
            width: '140px',
            align: 'center',
            placeholder: '请选择',
            defaultValue: '',
          },
          {
            title: '开票状态',
            key: 'invoiceStatus',
            type: JVXETypes.select,
            width: '120px',
            align: 'center',
            placeholder: '请选择',
            defaultValue: '',
            options: [
              { value: 'invoiced', label: '已开票' },
              { value: 'not_invoiced', label: '未开票' },
            ],
          },
          {
            title: '回款',
            key: 'paymentReceived',
            type: JVXETypes.inputNumber,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: 0,
          },
          {
            title: '应付时间',
            key: 'paymentDueDate',
            type: JVXETypes.date,
            width: '140px',
            align: 'center',
            placeholder: '请选择',
            defaultValue: '',
          },
          {
            title: '付款',
            key: 'paymentStatus',
            type: JVXETypes.select,
            width: '120px',
            align: 'center',
            placeholder: '请选择',
            defaultValue: '',
            options: [
              { value: 'paid', label: '已付款' },
              { value: 'unpaid', label: '未付款' },
            ],
          },
          {
            title: '备注',
            key: 'remark',
            type: JVXETypes.input,
            width: '140px',
            align: 'center',
            placeholder: '请输入',
            defaultValue: '',
          },
        ],
      },
    }
  },
  computed: {
    taxIncludedAmount() {
      return XEUtils.sum(this.model.materialDetailList, 'totalIncludeTax')
    },
  },
  created() {
    // 页面初始化时先加载项目列表，再加载报表数据
    this.loadProjectList().then(() => {
      // 项目列表加载完成后，再加载报表数据
      this.loadData()
      // 初始化字典配置
      this.initDictConfig()
    })
  },
  methods: {
    handleDelete(id) {
      var that = this
      deleteAction(that.url.delete, { id: id }).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadData()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    refreshTable() {
      this.$refs.materialDetailTable.refreshColumns()
    },
    // 四舍五入数量，每隔3位逗号分隔，默认3位小数
    formatQty({ cellValue, row, column }, digits = 3) {
      return this.formatAmt({ cellValue, row, column }, digits)
    },
    generateRequestParams() {
      return {
        ...this.model,
        taxIncludedAmount: this.taxIncludedAmount,
        materialDetailList: this.$refs.materialDetailTable.getTableData(),
      }
    },
    async customValidate() {
      const res = await this.$refs.materialDetailTable.validateTable()
      return res ? false : true
    },
    onEntryValueChange({ row, column }) {
      // 计算金额和毛利
      const taxRate = 0.13 // 税率13%
      
      if (column.property === 'purchasePriceExcludeTax' || column.property === 'totalMeters') {
        if (row.purchasePriceExcludeTax && row.totalMeters) {
          // 计算进总（未税）
          row.purchaseTotalExcludeTax = row.purchasePriceExcludeTax * row.totalMeters
        }
      }
      
      if (column.property === 'salePriceExcludeTax' || column.property === 'totalMeters') {
        if (row.salePriceExcludeTax && row.totalMeters) {
          // 计算合计（未税）
          row.totalExcludeTax = row.salePriceExcludeTax * row.totalMeters
          // 计算销价（含税）
          row.salePriceIncludeTax = row.salePriceExcludeTax * (1 + taxRate)
          // 计算合计（含税）
          row.totalIncludeTax = row.totalExcludeTax * (1 + taxRate)
        }
      }
      
      if (column.property === 'salePriceIncludeTax' || column.property === 'totalMeters') {
        if (row.salePriceIncludeTax && row.totalMeters) {
          // 计算销价（未税）
          row.salePriceExcludeTax = row.salePriceIncludeTax / (1 + taxRate)
          // 计算合计（未税）
          row.totalExcludeTax = row.salePriceExcludeTax * row.totalMeters
          // 计算合计（含税）
          row.totalIncludeTax = row.totalExcludeTax * (1 + taxRate)
        }
      }
      
      // 计算毛利
      if (row.totalExcludeTax && row.purchaseTotalExcludeTax) {
        row.grossProfit = row.totalExcludeTax - row.purchaseTotalExcludeTax
      }
    },
    setMaterialUnitOptions(row) {
      // 这里可以根据需要设置物料单位选项
    },
    searchQuery() {
      this.loadData(1)
    },
    searchReset() {
      this.queryParam.contractNo = ''
      this.queryParam.projectId = ''
      this.loadData(1)
    },
    // 加载项目列表
    loadProjectList() {
      return new Promise((resolve) => {
        if (this.projectList.length === 0) {
          getAction('/project/list', { pageNo: 1, pageSize: 9999 }).then((res) => {
            if (res.success) {
              this.projectList = res.result.records || []
            }
            resolve()
          }).catch(() => {
            resolve()
          })
        } else {
          resolve()
        }
      })
    },
    loadContractList(projectId) {
        if (!projectId) {
          this.contractList = [];
          return;
        }
        console.log('正在加载项目ID为', projectId, '的合同列表');
        getAction(`/project/contract/list?projectId=${projectId}&contractType=sales`)
          .then((res) => {
            console.log('合同列表接口响应:', res);
            if (res.success) {
              this.contractList = res.result.records || [];
              console.log('合同列表数据:', this.contractList);
              if (this.contractList.length === 0) {
                this.$message.info('该项目下暂无合同数据');
              }
            } else {
              this.$message.error('获取合同列表失败: ' + (res.message || '未知错误'));
            }
          })
          .catch((error) => {
            console.error('获取合同列表失败:', error);
            this.$message.error('获取合同列表失败');
          });
      },
    // 计算相同合同号的行合并数
    getSameContractRowSpan(index, field) {
      const currentRecord = this.dataSource[index]
      if (!currentRecord) return { rowSpan: 1 }
      
      const currentValue = currentRecord[field]
      let rowSpan = 1
      
      // 向前查找相同值的行
      for (let i = index - 1; i >= 0; i--) {
        if (this.dataSource[i][field] === currentValue) {
          return { rowSpan: 0 } // 不是第一行，不显示
        } else {
          break
        }
      }
      
      // 向后查找相同值的行
      for (let i = index + 1; i < this.dataSource.length; i++) {
        if (this.dataSource[i][field] === currentValue) {
          rowSpan++
        } else {
          break
        }
      }
      
      return { rowSpan }
    },
    // 自定义行属性
    customRow(record, index) {
      return {
        // 可以在这里添加行级别的自定义属性
      }
    },
    onProjectChange(projectId) {
      // 当项目改变时，清空合同选择并重新加载合同列表
      this.queryParam.contractNo = '';
      this.loadContractList(projectId);
    },
  },
}
</script>
<style lang="less" scoped>
.project-module-form {
  .date-input {
    width: 100%;
  }
  .upload-input {
    width: 100%;
    :deep(.ant-upload) {
      width: 100%;
      button {
        width: 100%;
      }
    }
  }
  .project-module-form-header {
    margin-top: 8px;
    .project-module-form-title {
      display: inline-flex;
      align-items: center;
      font-weight: 600;
      height: 50px;
      padding: 0 20px;
      background-color: #fff7ec;
      border-radius: 4px 4px 0 0;
      border-left: 1px solid #f08827;
      border-right: 1px solid #f08827;
      border-top: 1px solid #f08827;
    }
  }
  .project-module-form-body {
    margin-top: -1px;
    padding: 20px 10px 10px 10px;
    background-color: #fff7ec;
    border: 1px solid #f08827;
    .button-wrapper {
      margin-top: 10px;
      text-align: center;
    }
    .material-add-btn {
      padding: 0;
    }
  }
}

:deep(.j-vxe-table) {
  background-color: #ffffff;
}
.ant-select-disabled /deep/ .ant-select-selection {
  background-color: #f7f9fa;
  color: rgba(0, 0, 0, 0.65);
}

.ant-input-number-disabled {
  background-color: #f7f9fa;
  color: rgba(0, 0, 0, 0.65);
}

/deep/ .ant-input-disabled {
  background-color: #f7f9fa;
  color: rgba(0, 0, 0, 0.65);
}

/deep/ .ant-collapse-content-box {
  padding-left: 0;
  padding-right: 0;
}
/deep/ .ant-upload-disabled {
  button {
    background-color: #f7f9fa;
    cursor: not-allowed;
  }
}
.disabled-dep {
  /deep/ .ant-input {
    background-color: #f7f9fa;
  }
}
</style>