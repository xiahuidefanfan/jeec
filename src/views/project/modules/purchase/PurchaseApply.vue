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
        :checked="record.orderNo === model.orderNo"
        @click="myHandleDetail(record)"
      ></a-radio>
      <span slot="action" slot-scope="text, record">
        <a @click="applyRfq(record)">发起询价</a>
      </span>
    </a-table>
    <div class="project-module-form">
      <div class="project-module-form-header">
        <div class="project-module-form-title">
          <span>采购申请单 - {{ model.orderNo }}</span>
        </div>
      </div>
      <div class="project-module-form-body">
        <a-spin :spinning="confirmLoading">
          <a-form-model ref="moduleForm" :model="model" :rules="validatorRules">
            <a-row>
              <a-col :span="8">
                <a-form-model-item label="项目编号：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  {{ model.projectNo }}
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="客户名称：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  {{ model.customerId_dictText }}
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="销售订单编号：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  {{ model.orderNo }}
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="申请人" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  {{ model.createBy_dictText }}
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="申请时间" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
                  {{ model.createTime }}
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
          title: '采购申请编号',
          align: 'center',
          dataIndex: 'orderNo',
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
          title: '客户',
          align: 'center',
          dataIndex: 'supplierId_dictText',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '销售订单编号',
          align: 'center',
          dataIndex: 'sourceNo',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '申请人',
          align: 'center',
          dataIndex: 'createBy_dictText',
          ellipsis: true,
          sorter: true,
        },
        {
          title: '申请时间',
          align: 'center',
          dataIndex: 'createTime',
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
        list: '/project/projectOrder/list',
      },
      queryParam: {
        projectNo: this.projectNo,
        orderType: 'pur_apply_order',
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
          },
        ],
      },
    }
  },
  methods: {
    applyRfq(record) {
      this.$parent.createInquery(1, record)
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
