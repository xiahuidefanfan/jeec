<template>
  <a-spin :spinning="confirmLoading">
    <!-- 主表单区域 -->
    <div>
      <a-form-model ref="form" :model="order" :rules="validatorRules">
        <a-row>
          <a-col :span="8">
            <a-form-model-item label="采购合同编号：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
              {{ order.contractNo }}
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="采购订单编号：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
              {{ order.orderNo }}
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8">
            <a-form-model-item
              :label="action === 'return' ? '收货方' : '发货方'"
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }">
              {{ order.supplierId_dictText }}
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item
              label="联系人："
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }"
              prop="supplierContactPerson"
            >
              <a-input v-model="order.supplierContactPerson" :disabled="disabled" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item
              label="联系电话："
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }"
              prop="supplierContactPhone"
            >
              <a-input v-model="order.supplierContactPhone" :disabled="disabled" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8" v-if="action === 'return'">
            <a-form-model-item label="退货类型：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }" prop="returnType">
              <j-dict-select-tag v-model="order.returnType" dictCode="project_return_type" :disabled="disabled" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="合格证：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }" prop="certificate">
              <j-upload
                v-model="order.certificate"
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
              v-model="order.factoryReport"
              :beforeUpload="beforeUploadFactoryReport"
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
            :columns="materialTable.columns"
            :dataSource="order.materialDetailList"
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
            @valueChange="onEntryValueChange">
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
  inject: ['materialData'],
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
      validatorRules: {
        customerContactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        customerContactPhone: this.rules.mobile,
        supplierContactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
        supplierContactPhone: this.rules.mobile,
        factoryReport: [{ required: true, message: '请上传出厂报告', trigger: 'blur' }],
        certificate: [{ required: true, message: '请上传合格证', trigger: 'blur' }],
      },

      url: {
        add: '/project/distributeOrder/inboundApply',
        edit: '/project/distributeOrder/inboundApply',
        return: '/project/distributeOrder/productReturn'
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
      console.log(4444444)
      this.initMaterialRelated()
      this.action = actionType
      this.initMaterialList()
    },
    beforeUploadCertificate(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = this.order.contractNo + '_供应商合格证'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        resolve(modifiedFile)
      })
    },
    beforeUploadFactoryReport(file) {
      return new Promise((resolve) => {
        const extension = file.name.slice(file.name.lastIndexOf('.'))
        const fileName = this.order.contractNo + '_供应商出厂报告'
        const newName = `${fileName}${extension}`
        const modifiedFile = new File([file], newName, { type: file.type })
        resolve(modifiedFile)
      })
    },
    submit(action) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          postAction(this.url[action], this.order)
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
  },
}
</script>

<style lang="less" scoped>
</style>
