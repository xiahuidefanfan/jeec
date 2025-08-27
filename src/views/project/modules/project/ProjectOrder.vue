<template>
  <div class="project-module">
    <!-- 主表格：销售订单列表 -->
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
      <!-- 扩展行：分发订单明细 -->
      <p slot="expandedRowRender" slot-scope="record" class="table-wrapper">
        <a-table
          size="middle"
          bordered
          rowKey="id"
          :columns="innerColumns"
          :dataSource="record.distributeOrderList || []"
          :pagination="false"
        >
          <!-- 选择列 -->
          <a-radio
            slot="select"
            slot-scope="text, record"
            :checked="record.distributeOrderNo === model.distributeOrderNo"
            @click="myHandleDetail(record)"
          />

          <!-- 操作列 -->
          <span slot="action" slot-scope="text, record">
            <a-popconfirm
              :title="`确定删除【${record.distributeOrderNo}】这条货单吗?`"
              @confirm="() => handleDisOrderDelete(record.id)"
            >
              <a>删除</a>
            </a-popconfirm>
          </span>
        </a-table>
      </p>

      <!-- 主表选择列 -->
      <a-radio
        slot="select"
        slot-scope="text, record"
        :checked="record.orderNo === model.orderNo"
        @click="myHandleDetail(record)"
      />

      <!-- 主表操作列 -->
      <span slot="action" slot-scope="text, record">
        <template v-if="record.needPurchase">
          <a-popconfirm
            :title="`确定对【${record.orderNo}】这条订单发起采购申请吗?`"
            @confirm="() => handleProcureApply(record.orderNo)"
          >
            <a>采购申请</a>
          </a-popconfirm>
          <a-divider type="vertical" />
        </template>
        <template v-else>
          <a @click="handleGoods(record, 'delivery')">销售出库</a>
          <a-divider type="vertical" />
        </template>
        <a-popconfirm
          :title="`确定删除【${record.orderNo}】这条订单吗?`"
          @confirm="() => handleDelete(record.id)"
        >
          <a>删除</a>
        </a-popconfirm>
      </span>
    </a-table>

    <!-- 表单区域：销售订单详情/编辑 -->
    <div class="project-module-form">
      <div class="project-module-form-header">
        <div class="project-module-form-title">
          <span v-if="!model.orderNo">销售订单 - 新增</span>
          <span v-else>
            销售订单 - {{ model.orderNo }} - {{ action === 'edit' ? '编辑' : '详情' }}
          </span>
          <a-button
            v-if="model.orderNo && action !== 'edit'"
            type="link"
            icon="edit"
            @click="myHandleEdit(model)"
          />
        </div>
      </div>

      <div class="project-module-form-body">
        <a-spin :spinning="confirmLoading">
          <a-form-model ref="moduleForm" :model="model" :rules="validatorRules">
            <a-row>
              <!-- 客户 -->
              <a-col :span="8">
                <a-form-model-item label="客户" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="supplierId">
                  <j-search-select-tag
                    v-model="model.customerId"
                    :disabled="true"
                    :async="true"
                    dict="bas_customer,aux_name,id"
                  />
                </a-form-model-item>
              </a-col>

              <!-- 业务员 -->
              <a-col :span="8">
                <a-form-item label="业务员：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="businessPerson">
                  <j-select-user-by-dep
                    :class="disabled ? 'disabled-dep' : ''"
                    v-model="model.businessPerson"
                    :multi="true"
                    :disabled="disabled"
                    placeholder="请选择"
                  />
                </a-form-item>
              </a-col>

              <!-- 合计金额 -->
              <a-col :span="8">
                <a-form-model-item label="合计金额：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  <a-input v-model="transactionAmount" :disabled="true" placeholder="交易金额" />
                </a-form-model-item>
              </a-col>

              <!-- 账期 -->
              <a-col :span="8">
                <a-form-model-item label="账期：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="paymentDate">
                  <j-date
                    v-model="model.paymentDate"
                    :disabled="true"
                    placeholder="请选择"
                    class="date-input"
                  />
                </a-form-model-item>
              </a-col>

              <!-- 交货日期 -->
              <a-col :span="8">
                <a-form-model-item
                  label="交货日期："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="shipmentDate"
                >
                  <j-date
                    v-model="model.shipmentDate"
                    :disabled="true"
                    placeholder="请选择"
                    class="date-input"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>

            <!-- 物料明细表格 -->
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
                :toolbar-config="{
                  slots: ['prefix', 'suffix'],
                  btn: ['remove', 'clearSelection']
                }"
                :edit-config="{ trigger: 'click', mode: 'row', showIcon: false }"
                @edit-actived="({ row }) => setMaterialUnitOptions(row)"
                @selectRowChange="({ selectedRows }) => (materialTable.selectedRowCount = selectedRows.length)"
                @added="() => materialTable.rowCount++"
                @remove="() => (materialTable.rowCount = $refs.materialDetailTable.getTableData().length)"
                @valueChange="onEntryValueChange"
              />
            </div>
          </a-form-model>

          <!-- 提交按钮 -->
          <div v-if="action !== 'detail'" class="button-wrapper">
            <a-space>
              <a-button @click="myHandleCancel">取消</a-button>
              <a-button class="submit-btn" type="primary" @click="submit">
                {{ action === 'edit' ? '保存' : '提交' }}
              </a-button>
            </a-space>
          </div>
        </a-spin>
      </div>
    </div>

    <!-- 子组件引用 -->
    <project-order-goods ref="orderGoodsRef" @ok="loadData" />
    <out-bound-apply-order-goods ref="outBoundApplyOrderGoodsRef" @ok="loadData" />

    <!-- 退货方式选择模态框 -->
    <a-modal
      title="选择退货方式"
      :visible="returnTypeModalVisible"
      :maskClosable="false"
      :keyboard="false"
      @cancel="returnTypeModalVisible = false"
      :footer="null"
    >
      <a-form :form="returnTypeForm" layout="vertical">
        <a-form-item label="退货方式">
          <a-radio-group
            v-decorator="['returnType', { rules: [{ required: true, message: '请选择退货方式' }] }]"
          >
            <a-radio value="1">退货补货</a-radio>
            <a-radio value="2">退货退款</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleReturnTypeSubmit">确定</a-button>
          <a-button style="margin-left: 8px" @click="returnTypeModalVisible = false">取消</a-button>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 采购申请 - 选择业务员模态框 -->
    <a-modal
      title="选择业务员"
      :visible="procurementModalVisible"
      :maskClosable="false"
      :keyboard="false"
      @cancel="procurementModalVisible = false"
      :footer="null"
    >
      <a-form :form="procureForm" layout="vertical">
        <a-form-item label="业务员" has-feedback>
          <j-select-user-by-dep
            v-decorator="['businessPerson', { rules: [{ required: true, message: '请选择业务员' }] }]"
            placeholder="请选择业务员"
            :multi="false"
          />
        </a-form-item>
        <a-form-item style="text-align: right; margin-bottom: 0">
          <a-button @click="procurementModalVisible = false">取消</a-button>
          <a-button type="primary" style="margin-left: 8px" @click="handleProcureSubmit">
            确定
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import ATableDragResize from '@/views/erp/common/mixins/ATableDragResize.js'
import ProjectModuleMixin from '../ProjectModuleMixin.js'
import { postAction, deleteAction } from '@/api/manage'
import ProjectOrderGoods from './ProjectOrderGoods.vue'
import outBoundApplyOrderGoods from './OutBoundApplyOrderGoods.vue'
import XEUtils from 'xe-utils'

export default {
  name: 'ProjectOrder',
  mixins: [JeecgListMixin, ATableDragResize, ProjectModuleMixin],
  components: {
    ProjectOrderGoods,
    outBoundApplyOrderGoods
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
          title: '客户名称',
          align: 'center',
          dataIndex: 'customerId_dictText',
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
          customRender: (t, r, index) => (t === 'sales_return' ? '销售退货' : '销售出库'),
        },
        {
          title: '客户名称',
          align: 'center',
          dataIndex: 'customerId_dictText',
          ellipsis: true,
        },
        {
          title: '联系人',
          align: 'center',
          dataIndex: 'customerContactPerson',
          ellipsis: true,
        },
        {
          title: '联系方式',
          align: 'center',
          dataIndex: 'customerContactPhone',
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
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          width: 150,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/project/projectOrder/list',
        add: '/project/projectOrder/add',
        edit: '/project/projectOrder/edit',
        delete: '/project/projectOrder/delete',
        disOrderDelete: '/project/distributeOrder/delete',
        procureApply: '/project/projectOrder/procureApply',
        outBoundApply: '/project/distributeOrder/outBoundApply',
        canSelectMaterialList: '/project/projectOrder/canSelectMaterialList',
        canOutBoundMaterialList: '/project/projectOrder/canOutBoundMaterialList',
      },
      queryParam: {
        projectNo: this.projectNo,
        orderType: 'sales_order',
      },
      validatorRules: {
        paymentDate: [{ required: true, message: '请选择账期' }],
        shipmentDate: [{ required: true, message: '请选择交货日期' }]
      },
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
            disabled: true,
          },
          {
            title: '厂家订货号',
            key: 'materialCode',
            type: JVXETypes.normal,
            width: '150px',
            align: 'center',
          },
          {
            title: '名称',
            key: 'materialName',
            type: JVXETypes.normal,
            width: '150px',
            align: 'center',
          },
          {
            title: '客户物料编码',
            key: 'customerMaterialNo',
            type: JVXETypes.normal,
            align: 'center',
            defaultValue: '',
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
      returnTypeModalVisible: false,
      currentRecord: null,
      returnTypeForm: null,
      procurementModalVisible: false,
      currentProcureOrderNo: null,
      procureForm: this.$form.createForm(this, { name: 'procureForm' }),
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
    //剩余物料判断
    handleCanSelectMaterialList() {
      postAction(this.url.canSelectMaterialList, { contractNo: this.model.contractNo, orderType: this.model.orderType })
        .then((res) => {
          if (res.success) {
            this.model.materialDetailList = res.result
          } else {
            this.$warning({ content: res.message })
          }
        })
        .finally(() => {})
    },

    // 原来的 handleProcureApply 改名为 handleProcureSubmit
    handleProcureApply(orderNo) {
      this.currentProcureOrderNo = orderNo
      this.procureForm.resetFields()
      this.procurementModalVisible = true
    },
    //采购申请
    handleProcureSubmit() {
      this.procureForm.validateFields((err, values) => {
        if (!err) {
          const { businessPerson } = values
          const orderNo = this.currentProcureOrderNo

          // 发起采购申请，带上业务员
          postAction(this.url.procureApply, { orderNo, businessPerson })
            .then((res) => {
              if (res.success) {
                this.$message.success(res.message)
                this.loadData() // 刷新列表
              } else {
                this.$message.warning(res.message)
              }
            })
            .finally(() => {
              this.procurementModalVisible = false
            })
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
    //创建订单
    createOrder(record) {
      this.resetColumns()
      this.model = {
        orderType: 'sales_order',
        customerId: record.customerId,
        paymentDate: record.paymentDate,
        contractNo: record.contractNo,
        shipmentDate: record.shipmentDate,
        materialDetailList: [],
      }
      this.handleCanSelectMaterialList()
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
      postAction(this.url.canOutBoundMaterialList, {contractNo: record.contractNo})
        .then((res) => {
          if (res.success) {
            record.materialDetailList = res.result
          } else {
            this.$warning({ content: res.message })
          }
        })
        .finally(() => {})
      this.$refs.outBoundApplyOrderGoodsRef.show(record, type, type === 'return' ? 'return' : 'add')
    },
    showReturnTypeModal(record) {
      this.returnTypeModalVisible = true
      this.currentRecord = record
      if (this.returnTypeForm) {
        this.returnTypeForm.resetFields()
      }
    },
    handleReturnTypeSubmit() {
      this.returnTypeForm.validateFields((err, values) => {
        if (!err) {
          this.returnTypeModalVisible = false
          this.currentRecord.returnType = values.returnType
          this.handleGoods(this.currentRecord, 'return')
        }
      })
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
