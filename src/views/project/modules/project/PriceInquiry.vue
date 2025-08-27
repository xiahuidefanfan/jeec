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
        :checked="record.rfqNo === model.rfqNo"
        @click="myHandleDetail(record)"
      ></a-radio>
      <span slot="action" slot-scope="text, record">
        <a @click="handleQuotation(record)">销售报价</a>
        <a-divider type="vertical" />
        <a-popconfirm :title="`确定删除【${record.rfqNo}】这条询价单吗?`" @confirm="() => handleDelete(record.id)"
          ><a>删除</a></a-popconfirm
        >
      </span>
    </a-table>
    <div class="project-module-form">
      <a-button @click="myHandleAdd" type="primary" icon="plus">新增询价单</a-button>
      <div class="project-module-form-header">
        <div class="project-module-form-title">
          <span v-if="!model.rfqNo">询价单 - 新增</span>
          <span v-else>询价单 - {{ model.rfqNo }} - {{ action === 'edit' ? '编辑' : '详情' }}</span>
          <a-button
            v-if="model.rfqNo && action != 'edit'"
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
                <a-form-model-item
                  label="询价方："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="customerId"
                >
                  <j-search-select-tag
                    v-model="model.customerId"
                    :async="true"
                    dict="bas_customer,aux_name,id"
                    :disabled="disabled"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="询价时间：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="rfqDate">
                  <j-date placeholder="请选择" v-model="model.rfqDate" :disabled="disabled" class="date-input"></j-date>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="附件：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="attachment">
                  <j-upload v-model="model.attachment" :disabled="disabled" class="upload-input"></j-upload>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="联系人："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="contactPerson"
                >
                  <a-input v-model="model.contactPerson" placeholder="请输入" :disabled="disabled" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="联系电话："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="contactPhone">
                  <a-input v-model="model.contactPhone" placeholder="请输入" :disabled="disabled" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="联系邮箱："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="contactEmail">
                  <a-input v-model="model.contactEmail" placeholder="请输入" :disabled="disabled" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <!-- <a-button class="material-add-btn" @click="addMaterialDetail" type="link" icon="plus">新增物料</a-button> -->
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
                <template v-if="!disabled" v-slot:toolbarPrefix>
                  <a-button type="primary" icon="plus" @click="() => $refs.materialDetailTable.addRows({})"
                    >新增</a-button
                  >
                  <a-tooltip :title="materialTable.selectedRowCount !== 1 ? '请选择一行明细!' : ''" placement="bottom">
                    <a-button @click="handleCopyAndAdd" icon="plus" :disabled="materialTable.selectedRowCount !== 1"
                      >复制新增</a-button
                    >
                  </a-tooltip>
                </template>
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
  </div>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import ATableDragResize from '@/views/erp/common/mixins/ATableDragResize.js'
import ProjectModuleMixin from '../ProjectModuleMixin.js'
import pick from 'lodash.pick'
export default {
  name: 'PriceInquiry',
  mixins: [JeecgListMixin, ATableDragResize, ProjectModuleMixin],
  props: {
    // 定义 projectNo 属性
    projectNo: {
      type: String, // 或者根据实际情况选择其他类型
      required: true, // 如果 projectNo 是必须的
    },
  },
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
          title: '询价单号',
          align: 'center',
          dataIndex: 'rfqNo',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '项目编号',
          align: 'center',
          dataIndex: 'projectNo',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '询价方',
          align: 'center',
          dataIndex: 'customerId_dictText',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '询价时间',
          align: 'center',
          dataIndex: 'rfqDate',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '联系人',
          align: 'center',
          dataIndex: 'contactPerson',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '电话',
          align: 'center',
          dataIndex: 'contactPhone',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '操作',
          align: 'center',
          dataIndex: 'action',
          ellipsis: true,
          sorter: true,
          width: 150,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/project/rfq/list',
        add: '/project/rfq/add',
        edit: '/project/rfq/edit',
        delete: '/project/rfq/delete',
      },
      queryParam: {
        projectNo: this.projectNo,
        rfqType: 'sales_order',
      },
      validatorRules: {
        customerId: [{ required: true, message: '请选择询价方！' }],
        rfqDate: [{ required: true, message: '请选择询价时间！' }],
        contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        contactPhone: this.rules.mobile,
      },
      model: {
        customerId: '',
        rfqDate: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail:'',
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
            options: [],
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
            title: '名称',
            key: 'materialName',
            type: JVXETypes.normal,
            width: '150px',
            align: 'center',
          },
          {
            title: '客户物料编码',
            key: 'customerMaterialNo',
            type: JVXETypes.input,
            defaultValue: '',
            align: 'center',
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
          {
            title: '客户物料名称',
            key: 'customerMaterialName',
            align: 'center',
            type: JVXETypes.input,
            validateRules: [{ required: true, message: '${title}不能为空' }],
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
    }
  },
  methods: {
    // 四舍五入数量，每隔3位逗号分隔，默认3位小数
    formatQty({ cellValue, row, column }, digits = 3) {
      return this.formatAmt({ cellValue, row, column }, digits)
    },
    handleQuotation(record) {
      this.$parent.createQuotation(2, record)
    },
    handleCopyAndAdd() {
      let jxTable = this.$refs.materialDetailTable
      let row = pick(
        jxTable.selectedRows[0],
        'materialId',
        'materialCode',
        'materialName',
        'customerMaterialNo',
        'customerMaterialName',
        'materialBrand',
        'unit',
        'quantity',
        'unitPrice',
        'unitPriceCount',
        'description'
      )
      jxTable.addRows(row)
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
</style>
