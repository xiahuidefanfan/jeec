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
        :checked="record.contractNo === model.contractNo"
        @click="myHandleDetail(record)"
      ></a-radio>
      <span slot="action" slot-scope="text, record">
        <a @click="createOrder(record)">下发订单</a>
        <a-divider type="vertical" />
        <a-popconfirm :title="`确定删除【${record.contractNo}】这条订单吗?`" @confirm="() => handleDelete(record.id)"
          ><a>删除</a></a-popconfirm
        >
      </span>
    </a-table>
    <div class="project-module-form">
      <div class="project-module-form-header">
        <div class="project-module-form-title">
          <span v-if="!model.contractNo">采购合同-新增</span>
          <span v-else>采购合同 - {{ model.contractNo }} - {{ action === 'edit' ? '编辑' : '详情' }}</span>
          <a-button
            v-if="model.contractNo && action != 'edit'"
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
                  label="签订地点："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="signPlace"
                >
                  <a-input v-model="model.signPlace" placeholder="请输入" :disabled="disabled" />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="签订日期：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="rfqDate">
                  <j-date
                    placeholder="请选择"
                    v-model="model.signDate"
                    class="date-input"
                    :disabled="disabled"
                  ></j-date>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="甲方名称："
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
                <a-form-model-item
                  label="发货日期："
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
                <a-form-model-item label="账期：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="paymentDate">
                  <j-date
                    placeholder="请选择"
                    :disabled="disabled"
                    v-model="model.paymentDate"
                    class="date-input"
                  ></j-date>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="乙方名称："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="supplierId"
                >
                  <j-search-select-tag
                    v-model="model.supplierId"
                    :async="true"
                    dict="bas_supplier,aux_name,id"
                    :disabled="disabled"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="税点：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="taxPoint">
                  <a-input v-model="model.taxPoint" :disabled="disabled">% </a-input>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item
                  label="合同原件："
                  :labelCol="{ span: 4 }"
                  :wrapperCol="{ span: 19 }"
                  prop="attachment"
                >
                  <j-upload
                    v-model="model.attachment"
                    :beforeUpload="beforeUpload"
                    class="upload-input"
                    :disabled="disabled"
                  ></j-upload>
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
                <template v-if="!disabled" v-slot:toolbarPrefix>
                  <a-button type="primary" icon="plus" @click="() => $refs.materialDetailTable.addRows({})"
                    >新增</a-button
                  >
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
import { postAction } from '@/api/manage'
export default {
  name: 'ProjectContract',
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
          title: '合同编号',
          align: 'center',
          dataIndex: 'contractNo',
          ellipsis: true,
        },
        {
          title: '报价编号',
          align: 'center',
          dataIndex: 'quotationNo',
          ellipsis: true,
        },
        {
          title: '甲方名称',
          align: 'center',
          ellipsis: true,
          dataIndex: 'customerId_dictText',
        },
        {
          title: '乙方名称',
          align: 'center',
          dataIndex: 'supplierId_dictText',
          ellipsis: true,
        },
        {
          title: '发货日期',
          align: 'center',
          dataIndex: 'shipmentDate',
          width: 100,
          ellipsis: true,
        },
        {
          title: '账期',
          align: 'center',
          dataIndex: 'paymentDate',
          width: 100,
          ellipsis: true,
        },
        {
          title: '未税小计（元）',
          align: 'center',
          dataIndex: 'unitPriceCount',
          width: 150,
          ellipsis: true,
        },
        {
          title: '税点',
          align: 'center',
          dataIndex: 'taxPoint',
          width: 100,
          ellipsis: true,
        },
        {
          title: '含税小计（元）',
          align: 'center',
          dataIndex: 'taxIncludedSubtotal',
          width: 150,
          ellipsis: true,
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'status_dictText',
          width: 150,
          ellipsis: true,
        },
        {
          title: '操作',
          width: 150,
          align: 'center',
          dataIndex: 'action',
          ellipsis: true,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/project/contract/list',
        add: '/project/contract/add',
        edit: '/project/contract/edit',
        delete: '/project/contract/delete',
        changeStatus: '/project/contract/changeStatus',
      },
      queryParam: {
        projectNo: this.projectNo,
        contractType: 'purchase',
      },
      validatorRules: {
        shipmentDate: [{ required: true, message: '请选择发货日期！' }],
        paymentDate: [{ required: true, message: '请选择账期！' }],
      },
      model: {
        contractType: '',
        quotationNo: '',
        projectNo: '',
        customerId: '',
        supplierId: '',
        signPlace: '',
        signDate: '',
        shipmentDate: '',
        paymentDate: '',
        attachment: '',
        status: '',
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
            width: '150px',
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
      clickTimer: null,
    }
  },
  methods: {
    beforeUpload(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = '采购合同'
        const newName = `${fileName}${extension}`

        const modifiedFile = new File([file], newName, { type: file.type })
        console.log(modifiedFile)
        resolve(modifiedFile) // 阻止默认上传
      })
    },
    refreshTable() {
      this.$refs.materialDetailTable.refreshColumns()
    },
    //创建订单
    createOrder(record) {
      this.$parent.createOrder(4, record)
    },
    activePopoverVisibleChange(record, newVisible) {
      // 如果popover变为隐藏状态，且不是因为点击按钮显示的，阻止其隐藏
      if (!newVisible && !this.clickTimer) {
        record.activePopover = true
      }
      // 清除定时器
      clearTimeout(this.clickTimer)
      this.clickTimer = null
    },
    dataInit(records) {
      records.forEach((record) => {
        record.activePopover = false
        record.businessPerson = ''
      })
    },
    // 四舍五入数量，每隔3位逗号分隔，默认3位小数
    formatQty({ cellValue, row, column }, digits = 3) {
      return this.formatAmt({ cellValue, row, column }, digits)
    },
    createContract(record) {
      this.resetColumns()
      this.model = {
        contractType: 'purchase',
        quotationNo: record.quotationNo,
        customerId: record.customerId,
        supplierId: record.supplierId,
        taxPoint: record.taxPoint,
        materialDetailList: JSON.parse(JSON.stringify(record.materialDetailList)),
      }
      this.initMaterialList()
      this.action = 'add'
    },
    handleActive(record) {
      postAction(this.url.changeStatus, {
        id: record.id,
        status: 'active',
        businessPerson: record.businessPerson,
      }).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.loadData()
        } else {
          this.$message.warning(res.message)
        }
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
      return res ? false : true
    },
  },
}
</script>
<style lang="less" scoped>
.business-person {
  // width: 300px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  .business-person-label {
    margin-right: 10px;
    white-space: nowrap;
  }
  .business-person-button {
    width: 100%;
    text-align: right;
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
