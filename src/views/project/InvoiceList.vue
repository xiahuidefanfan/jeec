<template>
  <a-card class="invoice-list-container">
    <!-- 页面标题和状态切换 -->
    <div class="page-header">
    </div>

    <!-- 状态标签页 -->
    <div class="tabs-section">
      <a-tabs
        default-active-key="0"
        :tab-position="mode"
        v-model="queryParam.hadInvoice"
        type="card"
        @change="changeHadInvoice"
        class="status-tabs"
      >
        <a-tab-pane key="0" tab="未开票"></a-tab-pane>
        <a-tab-pane key="1" tab="已开票"></a-tab-pane>
      </a-tabs>
    </div>

    <!-- 数据表格 -->
    <div class="table-section">
      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
        class="data-table"
      >
        <a-radio
          slot-scope="text, record"
          slot="select"
          :checked="record.invoiceNo === model.invoiceNo"
          @click="myHandleDetail(record)"
        ></a-radio>
        <span slot="action" slot-scope="text, record">
          <a-space>
            <a-button 
              v-if="!record.invoiceNo && (!record.partyABill || record.partyABill === '')"
              @click="reconciliation(record)"
              type="primary"
              size="small"
            >
              对账
            </a-button>
            <a-button 
              v-if="!record.invoiceNo && (record.partyABill && record.partyABill !== '')"
              @click="invoicing(record)"
              type="primary"
              size="small"
            >
              开票
            </a-button>
             <a-button
               v-if="record.invoiceNo"
               @click="detail(record)"
               type="primary"
               size="small"
             >
              详情
          </a-button>
          </a-space>
        </span>
      </a-table>
    </div>
    <div
      class="project-module-form"
      v-if="
        (queryParam.hadInvoice === '0' && action === 'add') || (queryParam.hadInvoice === '1' && action === 'detail') || action === 'showDetail'
      "
    >
      <div class="project-module-form-header">
        <div class="project-module-form-title">
          <span v-if="action === 'add'">新增发票</span>
          <span v-else>单据编号 - {{ model.invoiceNo }}</span>
        </div>
      </div>
      <div class="project-module-form-body">
        <div class="price-inquiry-wrapper">
          <a-row>
            <a-col :span="8">
              <a-form-model-item label="合同编号" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                <!-- <a-input v-model="model.contractNo" :disabled="disabled" /> -->
                {{ model.contractNo }}
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="订单编号" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                {{ model.orderNo }}
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="货单编号" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                {{ model.distributeOrderNo }}
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="客户" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="customerId">
                {{ model.customerId_dictText }}
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="税点" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                {{ model.taxPoint }}%
              </a-form-model-item>
            </a-col>
          </a-row>
        </div>
        <a-spin :spinning="confirmLoading">
          <a-form-model ref="moduleForm" :model="model" :rules="validatorRules">
            <a-row>
              <a-col :span="8">
                <a-form-model-item label="发票编号" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="invoiceNo">
                  <a-input v-model="model.invoiceNo" :disabled="disabled" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="开票日期"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="invoiceDate"
                >
                  <j-date
                    placeholder="请选择"
                    :disabled="disabled"
                    v-model="model.invoiceDate"
                    class="date-input"
                  ></j-date>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="申请单"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="applicationAttachment">
                  <j-upload
                    v-model="model.applicationAttachment"
                    :beforeUpload="beforeApplicationAttachmentUpload"
                    class="upload-input"
                    :disabled="disabled"
                    bizPath="invoice"
                  ></j-upload>

                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="发票原件"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="attachment"
                >
                  <j-upload
                    v-model="model.attachment"
                    :beforeUpload="beforeAttachmentUpload"
                    class="upload-input"
                    :disabled="disabled"
                    bizPath="invoice"
                  ></j-upload>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="收款证明"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="paymentAttachment"
                >
                <j-upload
                  v-model="model.paymentAttachment"
                  :beforeUpload="beforePaymentAttachmentUpload"
                  class="upload-input"
                  :disabled="disabled"
                  bizPath="invoice"
                ></j-upload>

                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row v-if="action !== 'showDetail'">
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
                  :toolbar="false"
                  :edit-config="{ trigger: 'click', mode: 'row', showIcon: false }"
                >
                </j-vxe-table>
              </div>
            </a-row>
          </a-form-model>
          <div class="button-wrapper" v-if="action !== 'showDetail'">
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
    <!-- 对账表单 -->
    <div class="project-module-form" v-if="showReconciliationForm">
      <div class="project-module-form-header">
        <div class="project-module-form-title">
          <span>对账表单</span>
        </div>
      </div>
      <div class="project-module-form-body">
        <a-spin :spinning="confirmLoading">
          <a-form-model ref="reconciliationForm" :model="reconciliationModel">
            <a-row>
              <a-col :span="12">
                <a-form-model-item label="甲方账单" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  <j-upload
                    v-model="reconciliationModel.partyABill"
                    :beforeUpload="beforePartyABillUpload"
                    class="upload-input"
                    :disabled="disabled"
                    bizPath="reconciliation"
                  ></j-upload>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="乙方账单" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  <j-upload v-model="reconciliationModel.partyBBill" :beforeUpload="beforePartyBBillUpload" class="upload-input" bizPath="reconciliation"></j-upload>
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-form-model>
          <div class="button-wrapper">
            <a-space>
              <a-button @click="cancelReconciliation">取消</a-button>
              <a-button class="submit-btn" key="submit" @click="submitReconciliation" type="primary">
                对账
              </a-button>
            </a-space>
          </div>
        </a-spin>
      </div>
    </div>
  </a-card>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import ATableDragResize from '@/views/erp/common/mixins/ATableDragResize.js'
import ProjectModuleMixin from './modules/ProjectModuleMixin'
import { getAction, postAction } from '@/api/manage'

export default {
  name: 'InvoiceList',
  mixins: [JeecgListMixin, ATableDragResize, ProjectModuleMixin],
  data() {
    return {
      url: {
        list: '/project/invoice/list',
        list2: '/project/distributeOrder/list',
        add: '/project/invoice/add',
        edit: '/project/invoice/edit',
        delete: '/project/invoice/delete',
      },
      queryParam: {
        projectNo: this.projectNo,
        invoiceType: 'standard_send',
        hadInvoice: '0',
      },
      validatorRules: {
        invoiceNo: [{ required: true, message: '请输入发票编号！', trigger: 'blur' }],
        invoiceDate: [{ required: true, message: '请选择开票日期！', trigger: 'change' }],
        attachment: [{ required: true, message: '请上传发票原件！', trigger: 'change' }],
      },
      mode: 'top', // tabs位置
      model: {
        //设置初始值的属性、程序赋值的响应式属性
        contractNo: '',
        invoiceNo: '',
        orderNo: '',
        distributeOrderNo: '',
        projectNo: '',
        customerId: '',
        supplierId: '',
        customerId_dictText: '',
        applicationAttachment: '',
        paymentAttachment: '',
        attachment: '',
        materialDetailList: [],
        partyABill: '', // 甲方账单
        partyBBill: '', // 乙方账单
        taxPoint: '',
        invoiceDate: '',
      },
      reconciliationModel: {
        partyABill:  '',
        partyBBill:  ''
      },
      showReconciliationForm: false, // 是否显示对账表单
      currentRecord: null, // 当前对账的记录
      materialTable: {
        loading: false,
        rowCount: 0,
        selectedRowCount: 0,
        columns: [
          {
            title: '物料',
            key: 'materialId',
            type: JVXETypes.selectSearch,
            options: [{ value: 1, text: 2 }],
            dictCode: 'bas_material,aux_name,id',
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
            width: '120px',
            align: 'center',
          },
          {
            title: '数量',
            key: 'quantity',
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
          },
          {
            title: '未税单价(￥)',
            key: 'unitPrice',
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
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
            type: JVXETypes.normal,
            width: '140px',
            align: 'center',
            defaultValue: '',
          },
        ],
      },
      projectQuotationOptions: [],
      taxPointOptions: [13, 9, 6],
      disabled: false,
    }
  },
  computed: {
    currentProjectQuotation() {
      return this.projectQuotationOptions.find((item) => item.rfqNo === this.model.rfqNo) || {}
    },
    columns() {
      const distributeOrderColumns = [
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
          title: '订单编号',
          align: 'center',
          dataIndex: 'orderNo',
          ellipsis: true,
        },
        {
          title: '货单编号',
          align: 'center',
          dataIndex: 'distributeOrderNo',
          ellipsis: true,
        },
        {
          title: '供应商名称',
          align: 'center',
          dataIndex: 'supplierId_dictText',
          ellipsis: true,
        },
        {
          title: '发货人',
          align: 'center',
          dataIndex: 'supplierContactPerson',
          ellipsis: true,
        },
        {
          title: '到货方',
          align: 'center',
          dataIndex: 'customerId_dictText',
          ellipsis: true,
        },
        {
          title: '合计金额（元）',
          align: 'center',
          dataIndex: 'unitPriceCount',
          ellipsis: true,
        },
        {
          title: '是否开票',
          align: 'center',
          dataIndex: 'hadInvoice',
          ellipsis: true,
          customRender: (t) => (t ? '否' : '是'),
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          width: 150,
          ellipsis: true,
          scopedSlots: { customRender: 'action' },
        },
      ]
      const invoiceColumns = [
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
          title: '发票编号',
          align: 'center',
          dataIndex: 'invoiceNo',
          width: 140,
          ellipsis: true,
          sorter: true,
        },
        {
          title: '货单编号',
          align: 'center',
          dataIndex: 'distributeOrderNo',
          ellipsis: true,
          width: 140,
          sorter: true,
        },
        {
          title: '客户名称',
          align: 'center',
          dataIndex: 'customerId_dictText',
          ellipsis: true,
          width: 180,
          sorter: true,
        },
        {
          title: '开票人',
          align: 'center',
          dataIndex: 'supplierId_dictText',
          width: 140,
          ellipsis: true,
          sorter: true,
        },
        {
          title: '开票日期',
          align: 'center',
          dataIndex: 'invoiceDate',
          width: 160,
          ellipsis: true,
          sorter: true,
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          ellipsis: true,
          sorter: true,
          width: 140,
          scopedSlots: { customRender: 'action' },
        },
      ]
      return this.queryParam.hadInvoice === '0' ? distributeOrderColumns : invoiceColumns
    },
  },
  methods: {
    changeHadInvoice() {
      this.action = ''
      this.loadData(1)
    },
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      var params = this.getQueryParams() //查询条件
      this.loading = true
      const _url = this.queryParam.hadInvoice === '0' ? this.url.list2 : this.url.list
      this.dataSource = []
      getAction(_url, params)
        .then((res) => {
          if (res.success) {
            this.dataSource = res.result.records || res.result
            if (res.result.total) {
              this.ipagination.total = res.result.total
            } else {
              this.ipagination.total = 0
            }
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    invoicing(record) {
      this.model = {
        contractNo: record.contractNo,
        invoiceNo: '',
        orderNo: record.orderNo,
        distributeOrderNo: record.distributeOrderNo,
        projectNo: record.projectNo,
        customerId: record.customerId,
        supplierId: record.supplierId,
        customerId_dictText: record.customerId_dictText,
        applicationAttachment: '',
        paymentAttachment: '',
        attachment: '',
        materialDetailList: record.materialDetailList || [],
        taxPoint: record.taxPoint,
        invoiceDate: '',
        partyABill: '',
        partyBBill: '',
      }
      this.action = 'add'
      this.disabled = false
    },
    detail(record) {
      this.model = {
        contractNo: record.contractNo,
        invoiceNo: record.invoiceNo || '',
        orderNo: record.orderNo,
        distributeOrderNo: record.distributeOrderNo,
        projectNo: record.projectNo,
        customerId: record.customerId,
        supplierId: record.supplierId,
        customerId_dictText: record.customerId_dictText,
        applicationAttachment: record.applicationAttachment || '',
        paymentAttachment: record.paymentAttachment || '',
        attachment: record.attachment || '',
        materialDetailList: record.materialDetailList || [],
        taxPoint: record.taxPoint,
        invoiceDate: record.invoiceDate || '',
        partyABill: record.partyABill || '',
        partyBBill: record.partyBBill || '',
      }
      this.action = 'showDetail'
      this.disabled = true
    },
    beforeApplicationAttachmentUpload(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = this.model.contractNo + "_" + this.model.billNo + '_开票申请单'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        console.log(modifiedFile)
        resolve(modifiedFile)
      })
    },
    beforePaymentAttachmentUpload(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = this.model.contractNo + '_开票收款证明'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        console.log(modifiedFile)
        resolve(modifiedFile)
      })
    },
    beforeAttachmentUpload(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = this.model.contractNo + '_发票原件'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        console.log(modifiedFile)
        resolve(modifiedFile)
      })
    },
    beforePartyABillUpload(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = this.model.contractNo + '_对账甲方账单'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        console.log(modifiedFile)
        resolve(modifiedFile)
      })
    },
    beforePartyBBillUpload(file) {
      console.log('beforePartyBBillUpload:', file)
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = (this.model.contractNo || '合同') + '_对账已方账单'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        console.log('modifiedFile:', modifiedFile)
        resolve(modifiedFile)
      }).catch(error => {
        console.error('beforePartyBBillUpload error:', error)
        return file // 如果出错，返回原始文件
      })
    },
    generateRequestParams() {
      return {
        ...this.model,
        materialDetailList: this.$refs.materialDetailTable.getTableData(),
      }
    },
    async customValidate() {
      const res = await this.$refs.materialDetailTable.validateTable()
      return !res
    },
    // 对账相关方法
    reconciliation(record) {
      // 保存当前记录
      this.currentRecord = record
      // 重置对账表单数据
      this.reconciliationModel = {
        partyABill:  '',
        partyBBill:  '',
      }
      // 显示对账表单
      this.showReconciliationForm = true
      // 隐藏其他表单
      this.action = ''
    },
    cancelReconciliation() {
      this.showReconciliationForm = false
    },
    submitReconciliation() {
      // 验证表单
      if (!this.reconciliationModel.partyABill) {
        this.$message.warning('请上传甲方账单！')
        return
      }
      if (!this.reconciliationModel.partyBBill) {
        this.$message.warning('请上传乙方账单！')
        return
      }

      this.confirmLoading = true
      // 调用对账API
      const reconciliationData = {
        ...this.currentRecord,
        partyABill: this.reconciliationModel.partyABill,
        partyBBill: this.reconciliationModel.partyBBill
      }
      postAction('/project/distributeOrder/reconciliation', reconciliationData)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.cancelReconciliation()
            // 刷新列表数据
            this.loadData()
          } else {
            this.$message.error(res.message || '对账失败！')
          }
        })
        .catch((error) => {
          console.error('对账提交失败：', error)
          this.$message.error('对账提交失败，请稍后重试！')
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
  },
  created() {},
}
</script>
<style lang="less" scoped>
.invoice-row {
  // margin-bottom: 10px;
  &:first-child {
    text-align: center;
  }
  .invoice-type {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .invoice-type-item {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 40px;
      padding: 0 20px;
      border: 1px solid #e8e8e8;
      // font-size: 15px;
      background-color: #fafafa;
      color: rgba(0, 0, 0, 0.65);
      cursor: pointer;
      &:first-child {
        border-radius: 20px 0 0 20px;
        border-right: none;
      }
      &:last-child {
        border-radius: 0 20px 20px 0;
      }
    }
    .is-active {
      background-color: #1890ff;
      color: #fff;
      border: 1px solid #1890ff;
    }
  }
}
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
.price-inquiry-wrapper {
  // margin-bottom: 15px;
  // background-color: #f7f9fa;
  // border: 1px solid #d9d9d9;
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

// 修复tabs空行问题
.invoice-row {
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
}

/deep/ .ant-tabs {
  margin: 0 !important;
  padding: 0 !important;
}

/deep/ .ant-tabs-tabpane {
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 1 !important;
}

/deep/ .ant-tabs-content {
  padding: 0 !important;
  margin: 0 !important;
}

/deep/ .ant-tabs-content-holder {
  padding: 0 !important;
  margin: 0 !important;
}

/deep/ .ant-tabs-bar {
  margin: 0 !important;
}

/deep/ .ant-tabs-nav-container {
  margin: 0 !important;
}

/deep/ .ant-tabs-tab {
  margin: 0 !important;
}
</style>
./modules/project/ProjectModuleMixin
