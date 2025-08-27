<template>
  <a-spin :spinning="confirmLoading">
    <!-- 主表单区域 -->
    <div>
      <a-form-model ref="form" :model="model">
        <a-row>
          <a-col :span="8"> <a-form-model-item label="运单编号：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
            {{ model.distributeOrderNo }}
          </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="销售合同编号：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
              {{ model.contractNo }}
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="销售订单编号：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
              {{ model.orderNo }}
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8">
            <a-form-model-item
              label="收货方"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }">
              {{ model.supplierText }}
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item
              label="联系人："
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }"
              prop="customerContactPerson"
            >
              <a-input v-model="model.customerContactPerson" :disabled="disabled" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item
              label="联系电话："
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }"
              prop="customerContactPhone"
            >
              <a-input v-model="model.customerContactPhone" :disabled="disabled" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" v-if="action === 'return'">
            <a-form-model-item label="退货类型：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }" prop="returnType">
              <j-dict-select-tag v-model="model.returnType" dictCode="project_return_type" :disabled="disabled" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="合格证：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }" prop="certificate">
              <j-upload
                v-model="model.certificate"
                :beforeUpload="beforeUploadCertificate"
                class="upload-input"
                :disabled="disabled"
              ></j-upload>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item
              label="出厂报告："
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }"
              prop="factoryReport"
            >
            <j-upload
              v-model="model.factoryReport"
              :beforeUpload="beforeUploadFactoryReport"
              class="upload-input"
              :disabled="disabled"
            ></j-upload>
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row v-if="showReconciliationFields">
          <a-col :span="8">
            <a-form-model-item label="甲方账单：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }" prop="partyABill">
              <j-upload
                v-model="model.partyABill"
                :disabled="disabled"
                class="upload-input"
              ></j-upload>
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="乙方账单：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }" prop="partyBBill">
              <j-upload
                v-model="model.partyBBill"
                :disabled="disabled"
                class="upload-input"
              ></j-upload>
            </a-form-model-item>
          </a-col>
        </a-row>
        <div class="material-table">
          <j-vxe-table
            ref="materialDetailTable"
            keep-source
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
    </div>
  </a-spin>
</template>

<script>
import { postAction } from '@/api/manage'
import { JVxeTableModelMixin } from '@/mixins/JVxeTableModelMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
import ProjectModuleMixin from '../ProjectModuleMixin.js'
export default {
  name: 'ProjectForm',
  mixins: [JVxeTableModelMixin, ProjectModuleMixin],
  components: {},
  props: {
    order: Object,
  },
  data() {
    return {
      model: {
        //设置初始值的属性、程序赋值的响应式属性
        projectName: '',
        customerId: '',
        description: '',
        managerId: '',
        materialDetailList: [],
      },
      action: '',
      confirmLoading: false,
      refKeys: [],
      showReconciliationFields: false, // 控制甲方账单和乙方账单字段的显示

      url: {
        add: '/project/distributeOrder/add',
        edit: '/project/distributeOrder/change',
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
            align: 'center',
          },
          {
            title: '数量',
            key: 'quantity',
            type: JVXETypes.inputNumber,
            width: '150px',
            align: 'center',
            formatter: this.formatQty,
            placeholder: '请输入',
            defaultValue: '',
            validateRules: [{ required: true, message: '${title}不能为空' }],
          },
        ],
      },
      clickTimer: null,
    }
  },

  computed: {},

  created() {},

  methods: {
    add(actionType) {
      this.initMaterialRelated()
      console.log(111111)
      this.model = {
        orderNo: this.order.orderNo,
        projectNo: this.order.projectNo,
        distributeOrderNo: this.order.distributeOrderNo,
        contractNo: this.order.contractNo,
        customerId: this.order.customerId,
        customerId_dictText: this.order.customerId_dictText,
        customerContactPerson: this.order.customerContactPerson,
        customerContactPhone: this.order.customerContactPhone,
        supplierId: this.order.supplierId,
        supplierText: this.order.supplierText,
        supplierContactPerson: this.order.supplierContactPerson,
        supplierContactPhone: this.order.supplierContactPhone,
        orderType: actionType === 'return' ? 'purchase_return' : 'standard_receipt',
        factoryReport: this.order.factoryReport || '',
        certificate: this.order.certificate || '',
        partyABill: this.order.partyABill || '',
        partyBBill: this.order.partyBBill || '',
        materialDetailList: JSON.parse(JSON.stringify(this.order.materialDetailList || [])),
        source_no: actionType === 'return' ? this.order.distributeOrderNo : '',
      }
      this.action = actionType
      this.initMaterialList()
    },
    beforeUploadCertificate(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = this.model.contractNo + '_供应商合格证'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        resolve(modifiedFile)
      })
    },
    beforeUploadFactoryReport(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = this.model.contractNo + '_供应商出厂报告'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        resolve(modifiedFile)
      })
    },
    submit(action) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          postAction(this.url[action], this.model)
            .then((res) => {
              if (res.success) {
                this.$message.success(res.message)
                this.$emit('ok')
                this.close()
              } else {
                this.$warning({ content: res.message })
              }
            })
            .finally(() => {
              this.confirmLoading = false
            })
        }
      })
    },
    // 显示对账字段
    showReconciliation() {
      this.showReconciliationFields = true
    },
    // 隐藏对账字段
    hideReconciliation() {
      this.showReconciliationFields = false
    },
  },
}
</script>

<style lang="less" scoped>
// .ant-row {
//   margin-bottom: 10px;
// }
</style>
