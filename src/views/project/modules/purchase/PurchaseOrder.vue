<template>
  <div class="project-module">
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
      <p class="table-wrapper" slot="expandedRowRender" slot-scope="record">
        <a-table
          ref="table"
          size="middle"
          bordered
          rowKey="id"
          :columns="innerColumns"
          :dataSource="record.distributeOrderList || []"
          :pagination="false"
        >
          <a-radio
            slot-scope="text, record"
            slot="select"
            :checked="record.distributeOrderNo === model.distributeOrderNo"
            @click="myHandleDetail(record)"
          ></a-radio>
        </a-table>
      </p>

      <a-radio
        slot-scope="text, record"
        slot="select"
        :checked="record.orderNo === model.orderNo"
        @click="myHandleDetail(record)"
      ></a-radio>
      <span slot="action" slot-scope="text, record">
        <a @click="handleGoods(record, 'arrived')" v-if="record.status==='create'">到货</a>
        <a-divider type="vertical" v-if="record.status==='create'" />
        <a-popconfirm :title="`确定删除【${record.orderNo}】这条采购订单吗?`"  v-if="record.status==='create'" @confirm="() => handleDelete(record.id)"
          ><a>删除</a></a-popconfirm>
      </span>
    </a-table>
    <div class="project-module-form">
      <div class="project-module-form-header">
        <div class="project-module-form-title">
          <span v-if="!model.orderNo">采购订单 - 新增</span>
          <span v-else>采购订单 - {{ model.orderNo }} - {{ action === 'edit' ? '编辑' : '详情' }}</span>
          <a-button
            v-if="model.orderNo && action != 'edit'"
            @click="myHandleEdit(model)"
            type="link"
            icon="edit"
          ></a-button>
        </div>
      </div>
      <div class="project-module-form-body">
        <a-spin :spinning="confirmLoading">
          <a-form-model ref="moduleForm" :model="model" :rules="validatorRules">
            <a-row>
              <!-- 客户 -->
              <a-col :span="8">
                <a-form-model-item label="供应商" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="supplierId">
                  <j-search-select-tag
                    v-model="model.supplierId"
                    :disabled="true"
                    :async="true"
                    dict="bas_supplier,aux_name,id"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="交货日期："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="shipmentDate"
                >
                  <j-date
                    placeholder="请选择"
                    :disabled="disabled"
                    v-model="model.shipmentDate"
                    class="date-input"
                  ></j-date>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="合计金额：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  <a-input v-model="transactionAmount" :disabled="true" placeholder="交易金额" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="账期：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="paymentDate">
                  <j-date
                    placeholder="请选择"
                    :disabled="disabled"
                    v-model="model.paymentDate"
                    class="date-input"
                  ></j-date>
                </a-form-model-item>
              </a-col>
            </a-row>
            <div class="material-table">
              <j-vxe-table
                ref="materialDetailTable"
                keep-source
                :loading="materialTable.loading"
                :columns="materialTable.columns"
                :dataSource="model.materialDetailList"
                :maxHeight="300"
                :disabled="disabled"
                :rowNumber="true"
                :rowSelection="!disabled"
                :toolbar="!disabled"
                :resizable="true"
                :toolbar-config="{ slots: ['prefix', 'suffix'], btn: ['remove', 'clearSelection'] }"
                :edit-config="{ trigger: 'click', mode: 'row', showIcon: false }"
                @edit-actived="({ row }) => setMaterialUnitOptions(row)"
                @selectRowChange="({ selectedRows }) => (this.materialTable.selectedRowCount = selectedRows.length)"
                @added="
                  (event) => {
                    this.materialTable.rowCount++
                  }
                "
                @remove="() => (this.materialTable.rowCount = this.$refs.materialTable.getTableData().length)"
                @valueChange="onEntryValueChange"
              >
              </j-vxe-table>
            </div>
          </a-form-model>
          <div class="button-wrapper" v-if="action !== 'detail'">
            <a-space>
              <a-button @click="myHandleCancel">取消</a-button>
              <a-button class="submit-btn" key="submit" @click="submit" type="primary">
                {{ action === 'edit' ? '保存' : '提交' }}
              </a-button>
            </a-space>
          </div>
        </a-spin>
      </div>
    </div>
    <in-bound-order-goods ref="inBoundOrderGoodsRef" @ok="loadData"></in-bound-order-goods>
  </div>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import ATableDragResize from '@/views/erp/common/mixins/ATableDragResize.js'
import ProjectModuleMixin from '../ProjectModuleMixin.js'
import { postAction, deleteAction } from '@/api/manage'
import InBoundOrderGoods from './InBoundOrderGoods.vue'
import XEUtils from 'xe-utils'

export default {
  name: 'ProjectOrder',
  mixins: [JeecgListMixin, ATableDragResize, ProjectModuleMixin],
  components: {
    InBoundOrderGoods,
  },
  data() {
    return {
      // 表头
      columns: [
        {
          title: '',
          dataIndex: 'select',
          width: 40,
          align: 'center',
          scopedSlots: { customRender: 'select' },
        },
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 40,
          align: 'center',
          customRender: (t, r, index) => parseInt(index) + 1,
        },
        {
          title: '订单编号',
          align: 'center',
          dataIndex: 'orderNo',
          ellipsis: true,
        },
        {
          title: '合同编号',
          align: 'center',
          dataIndex: 'contractNo',
          ellipsis: true,
        },
        {
          title: '供应商名称',
          align: 'center',
          dataIndex: 'supplierId_dictText',
          ellipsis: true,
        },
        {
          title: '发货日期',
          align: 'center',
          dataIndex: 'shipmentDate',
          ellipsis: true,
        },
        {
          title: '账期',
          align: 'center',
          dataIndex: 'paymentDate',
          ellipsis: true,
        },
        {
          title: '业务员',
          align: 'center',
          dataIndex: 'businessPerson_dictText',
          ellipsis: true,
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'status_dictText',
          ellipsis: true,
        },
        {
          title: '未税小计（元）',
          align: 'center',
          dataIndex: 'transactionAmount',
          ellipsis: true,
        },
        {
          width: 150,
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          ellipsis: true,
          scopedSlots: { customRender: 'action' },
        },
      ],
      //货单表头
      innerColumns: [
        {
          title: '单据号',
          align: 'center',
          dataIndex: 'distributeOrderNo',
          ellipsis: true,
        },
        {
          title: '货单类型',
          align: 'center',
          dataIndex: 'orderType',
          ellipsis: true,
          customRender: (t, r, index) => (t === 'purchase_return' ? '退货' : '到货'),
        },
        {
          title: '供应商名称',
          align: 'center',
          dataIndex: 'supplierId_dictText',
          ellipsis: true,
        },
        {
          title: '联系人',
          align: 'center',
          dataIndex: 'supplierContactPerson',
          ellipsis: true,
        },
        {
          title: '联系电话',
          align: 'center',
          dataIndex: 'supplierContactPhone',
          ellipsis: true,
        },
        {
          title: '合计金额（元）',
          align: 'center',
          dataIndex: 'unitPriceCount',
          ellipsis: true,
        },
        {
          title: '货单状态',
          align: 'center',
          dataIndex: 'reviewState_dictText',
          ellipsis: true,
        },
      ],
      url: {
        list: '/project/projectOrder/list',
        add: '/project/projectOrder/add',
        edit: '/project/projectOrder/edit',
        delete: '/project/projectOrder/delete',
        disOrderDelete: '/project/distributeOrder/delete',
        procureApply: '/project/projectOrder/procureApply',
        inboundApply: '/project/distributeOrder/inboundApply',
        canSelectMaterialList: '/project/projectOrder/canSelectMaterialList',
      },
      queryParam: {
        projectNo: this.projectNo,
        orderType: 'pur_order',
      },
      validatorRules: {},
      model: {
        orderNo: ' ',
        orderType: ' ',
        projectNo: ' ',
        contractNo: ' ',
        customerId: ' ',
        supplierId: ' ',
        shipmentDate: ' ',
        paymentDate: ' ',
        businessPerson: ' ',
        materialDetailList: [],
      },
      materialTable: {
        loading: false,
        rowCount: 0,
        selectedRowCount: 0,
        columns: [
          {
            title: '物料',
            key: 'materialName',
            type: JVXETypes.normal,
            align: 'center',
          },
          {
            title: '厂家订货号',
            key: 'materialCode',
            type: JVXETypes.normal,
            align: 'center',
          },
          {
            title: '客户物料编码',
            key: 'customerMaterialNo',
            type: JVXETypes.normal,
            align: 'center',
          },
          {
            title: '客户物料名称',
            key: 'customerMaterialName',
            align: 'center',
            type: JVXETypes.normal,
            defaultValue: '',
          },
          {
            title: '品牌',
            key: 'materialBrand',
            type: JVXETypes.normal,
            width: 'brand',
            align: 'center',
          },
          {
            title: '单位',
            key: 'unit',
            type: JVXETypes.normal,
            width: '100px',
            align: 'center',
          },
          {
            title: '数量',
            key: 'quantity',
            type: JVXETypes.inputNumber,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '未税单价(￥)',
            key: 'unitPrice',
            type: JVXETypes.inputNumber,
            width: '120px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '未税小计(￥)',
            key: 'unitPriceCount',
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
            statistics: ['sum'],
          },
          {
            title: '交货周期',
            key: 'description',
            type: JVXETypes.input,
            width: '140px',
            align: 'center',
            placeholder: '请输入',
            defaultValue: '',
          },
        ],
      },
      projectOrderOptions: [],
      taxPointOptions: [13, 9, 6],
    }
  },
  computed: {
    currentProjectQuotation() {
      return this.projectOrderOptions.find((item) => item.orderNo === this.model.orderNo)
    },
    transactionAmount() {
      return XEUtils.sum(this.model.materialDetailList, 'unitPriceCount')
    },
  },
  methods: {
    handleDisOrderDelete(id) {
      var that = this
      deleteAction(that.url.disOrderDelete, { id: id }).then((res) => {
        if (res.success) {
          //重新计算分页问题
          that.$message.success(res.message)
          that.loadData()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    //采购申请
    handleProcureApply(orderNo) {
      postAction(this.url.procureApply, { orderNo })
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
          } else {
            this.$warning({ content: res.message })
          }
        })
        .finally(() => {})
    },
    refreshTable() {
      this.$refs.materialDetailTable.refreshColumns()
    },
    // 四舍五入数量，每隔3位逗号分隔，默认3位小数
    formatQty({ cellValue, row, column }, digits = 3) {
      return this.formatAmt({ cellValue, row, column }, digits)
    },
    //创建订单
    createOrder(record) {
      this.resetColumns()
      this.model = {
        orderType: 'pur_order',
        supplierId: record.supplierId,
        customerId: record.customerId,
        paymentDate: record.paymentDate,
        contractNo: record.contractNo,
        shipmentDate: record.shipmentDate,
        materialDetailList: JSON.parse(JSON.stringify(record.materialDetailList)),
      }
      this.initMaterialList()
      // this.handleCanSelectMaterialList()
      this.action = 'add'
    },
    generateRequestParams() {
      return {
        ...this.model,
        transactionAmount: this.transactionAmount,
        materialDetailList: this.$refs.materialDetailTable.getTableData(),
      }
    },
    async customValidate() {
      const res = await this.$refs.materialDetailTable.validateTable()
      return res ? false : true
    },
    handleGoods(record, type) {
      this.$refs.inBoundOrderGoodsRef.show(record, type, type === 'return' ? 'return' : 'add')
    },
    handleProductReturnGoods(record, type) {
      this.$refs.inBoundOrderGoodsRef.show(record, type, 'return', 'productReturn')
    },
    showDetailGoods(record, type) {
      this.$refs.inBoundOrderGoodsRef.show(record, type, type === 'return' ? 'return' : 'add')
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
