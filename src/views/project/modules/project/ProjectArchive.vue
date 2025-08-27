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
        <span v-if="record.status === 'end'">
          <a @click="archive(record)">归档</a>
        </span>
        <span v-else-if="record.status === 'archived'">
          <span><a-icon type="download"/>&nbsp;下载</span>
        </span>
      </span>
    </a-table>
    </div>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ATableDragResize from '@/views/erp/common/mixins/ATableDragResize.js'
import ProjectModuleMixin from '../ProjectModuleMixin.js'
import { postAction } from '@/api/manage'
export default {
  name: 'ProjectArchive',
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
          width: 200,
          ellipsis: true,
        },
        {
          title: '甲方名称',
          align: 'center',
          ellipsis: true,
          width: 200,
          dataIndex: 'customerId_dictText',
        },
        {
          title: '乙方名称',
          align: 'center',
          width: 200,
          dataIndex: 'supplierId_dictText',
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
          width: 150,
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
        archive: '/project/contract/archive'
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
      clickTimer: null,
    }
  },
  methods: {
    refreshTable() {
      this.$refs.materialDetailTable.refreshColumns()
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
    archive(record) {
      postAction(this.url.archive, {
        id: record.id,
        contractNo: record.contractNo
      }).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.loadData()
        } else {
          this.$message.warning(res.message)
        }
      })
    },
    archiveDownload(record) {
      postAction(this.url.archiveDownload, {
        id: record.id
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
