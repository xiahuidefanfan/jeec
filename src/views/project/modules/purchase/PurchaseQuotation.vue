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
      <a-radio
        slot-scope="text, record"
        slot="select"
        :checked="record.quotationNo === model.quotationNo"
        @click="myHandleDetail(record)"
      ></a-radio>
      <span slot="action" slot-scope="text, record">
        <a @click="signContract(record)">签订合同</a>
        <a-divider type="vertical" />
        <a-popconfirm :title="`确定删除【${record.quotationNo}】这条报价单吗?`" @confirm="() => handleDelete(record.id)"
          ><a>删除</a></a-popconfirm
        >
      </span>
    </a-table>
    <div class="project-module-form">
      <!-- <a-button @click="myHandleAdd" type="primary" icon="plus">新增报价单</a-button> -->
      <div class="project-module-form-header">
        <div class="project-module-form-title">
          <span v-if="!model.quotationNo">供应商报价-新增</span>
          <span v-else>报价单 - {{ model.quotationNo }} - {{ action === 'edit' ? '编辑' : '详情' }}</span>
          <a-button
            v-if="model.quotationNo && action != 'edit'"
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
              <a-col :span="8">
                <a-form-model-item label="报价方" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="supplierId">
                  <j-search-select-tag
                    v-model="model.supplierId"
                    :disabled="disabled"
                    :async="true"
                    dict="bas_supplier,aux_name,id"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="联系人"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="customerContactPerson"
                >
                  <a-input v-model="model.customerContactPerson" :disabled="disabled" placeholder="请输入" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="手机号"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="customerContactPhone"
                >
                  <a-input v-model="model.customerContactPhone" :disabled="disabled" placeholder="请输入" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="报价时间"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="quotationDate"
                >
                  <j-date
                    placeholder="请选择"
                    :disabled="disabled"
                    v-model="model.quotationDate"
                    class="date-input"
                  ></j-date>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="有效期至"
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="effectiveDate"
                >
                  <j-date
                    placeholder="请选择"
                    :disabled="disabled"
                    v-model="model.effectiveDate"
                    class="date-input"
                  ></j-date>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="税点" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="taxPoint">
                  <a-select :disabled="disabled" v-model="model.taxPoint">
                    <a-select-option v-for="option in taxPointOptions" :key="option" :value="option"
                      >{{ option }}%</a-select-option
                    >
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="附件" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="attachment">
                  <j-upload v-model="model.attachment" :disabled="disabled" class="upload-input"></j-upload>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="交易条款" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="terms">
                  <a-textarea v-model="model.terms" :disabled="disabled" placeholder="交易条款" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row>
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
                  :rowSelection="true"
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
            </a-row>
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
  </div>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import ATableDragResize from '@/views/erp/common/mixins/ATableDragResize.js'
import ProjectModuleMixin from '../ProjectModuleMixin.js'
import { getAction } from '@/api/manage'

export default {
  name: 'ProjectQuotation',
  mixins: [JeecgListMixin, ATableDragResize, ProjectModuleMixin],
  data() {
    return {
      // 表头
      columns: [
        {
          title: '',
          dataIndex: 'select',
          fixed: 'left',
          width: 40,
          align: 'center',
          scopedSlots: { customRender: 'select' },
        },
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
          title: '报价单号',
          align: 'center',
          dataIndex: 'quotationNo',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '询价单号',
          align: 'center',
          dataIndex: 'rfqNo',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '报价方',
          align: 'center',
          dataIndex: 'supplierId_dictText',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '报价时间',
          align: 'center',
          dataIndex: 'quotationDate',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '税点',
          align: 'center',
          dataIndex: 'taxPoint',
          width: 140,
          ellipsis: true,
          sorter: true,
        },
        {
          title: '未税小计',
          align: 'center',
          dataIndex: 'unitPriceCount',
          width: 140,
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
      ],
      url: {
        list: '/project/quotation/list',
        add: '/project/quotation/add',
        edit: '/project/quotation/edit',
        delete: '/project/quotation/delete',
      },
      queryParam: {
        projectNo: this.projectNo,
        quotationType: 'pur_order',
      },
      validatorRules: {
        supplierId: [{ required: true, message: '请选择报价方！' }],
        quotationDate: [{ required: true, message: '请设置报价时间！' }],
        effectiveDate: [{ required: true, message: '请设置有效时间！' }],
        supplierContactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        supplierContactPhone: this.rules.mobile,
        taxPoint: [{ required: true, message: '请选择税点！' }],
      },
      model: {
        rfqNo: '',
        supplierId: '',
        customerId: '',
        quotationDate: '',
        supplierContactPerson: '',
        supplierContactPhone: '',
        taxPoint: '',
        materialDetailList: [],
      },
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
            fixed: 'left',
            placeholder: '请选择',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }],
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
      projectQuotationOptions: [],
      taxPointOptions: [13, 9, 6],
    }
  },
  computed: {
    currentProjectQuotation() {
      return this.projectQuotationOptions.find((item) => item.rfqNo === this.model.rfqNo) || {}
    },
  },
  methods: {
    // 四舍五入数量，每隔3位逗号分隔，默认3位小数
    formatQty({ cellValue, row, column }, digits = 3) {
      return this.formatAmt({ cellValue, row, column }, digits)
    },
    refreshTable() {
      this.$refs.materialDetailTable.refreshColumns()
    },
    createQuotation(record) {
      this.resetColumns()
      this.model = {
        rfqNo: record.rfqNo,
        applyNo: record.applyNo,
        customerId: record.customerId,
        materialDetailList: JSON.parse(JSON.stringify(record.materialDetailList)),
      }
      this.initMaterialList()
      this.action = 'add'
    },
    signContract(record) {
      this.$parent.createContract(3, record)
    },
    generateRequestParams() {
      return {
        ...this.model,
        materialDetailList: this.$refs.materialDetailTable.getTableData(),
      }
    },
    async customValidate() {
      const res = await this.$refs.materialDetailTable.validateTable()
      return res ? false : true
    },
    getPriceInqueryData() {
      getAction('/project/rfq/list', { pageNo: 1, pageSize: 9999 }).then((res) => {
        let { result } = res
        this.projectQuotationOptions = result.records
      })
    },
  },
  created() {
    this.getPriceInqueryData()
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
.price-inquiry-wrapper {
  margin-bottom: 15px;
  background-color: #f7f9fa;
  border: 1px solid #d9d9d9;
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
</style>
