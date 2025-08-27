<template>
  <a-spin :spinning="confirmLoading">
    <!-- 主表单区域 -->
    <a-form-model ref="form" :model="model" :rules="validatorRules">
      <a-row>
        <a-col :span="8">
          <a-form-model-item label="合同编号：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
            <!-- <a-input v-model="model.contractNo" :disabled="disabled" /> -->
            {{ model.contractNo }}
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item label="订单编号：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
            {{ model.orderNo }}
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item
            :label="(model.orderType === 'pur_order' ? '到货' : '发货') + '单编号'"
            :labelCol="{ span: 4 }"
            :wrapperCol="{ span: 19 }"
          >
            {{ model.distributeOrderNo }}
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item label="客户：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="customerId">
            {{ model.customerId_dictText }}
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item label="税点：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }">
            {{ model.taxPoint }}%
          </a-form-model-item>
        </a-col>
      </a-row>
      <a-row>
        <!-- <a-col :span="8">
            <a-form-model-item label="供应商" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="supplierId">
              {{ model.supplierId_dictText }}
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item
              label="发货联系人"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 19 }"
              prop="supplierContactPerson"
            >
              <a-input v-model="model.supplierContactPerson" :disabled="disabled" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item
              label="联系电话"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 19 }"
              prop="supplierContactPhone"
            >
              <a-input v-model="model.supplierContactPhone" :disabled="disabled" />
            </a-form-model-item>
          </a-col> -->
        <a-col :span="8">
          <a-form-model-item label="发票编号：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="invoiceNo">
            <a-input v-model="model.invoiceNo" :disabled="disabled" />
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item label="开票日期：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="invoiceDate">
            <j-date placeholder="请选择" :disabled="disabled" v-model="model.invoiceDate" class="date-input"></j-date>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item
            label="申请单"
            :labelCol="{ span: 4 }"
            :wrapperCol="{ span: 19 }"
            prop="applicationAttachment"
          >
            <j-upload v-model="model.applicationAttachment" :disabled="disabled" class="upload-input"></j-upload>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item
            label="收款证明："
            :labelCol="{ span: 4 }"
            :wrapperCol="{ span: 19 }"
            prop="paymentAttachment"
          >
            <j-upload v-model="model.paymentAttachment" :disabled="disabled" class="upload-input"></j-upload>
          </a-form-model-item>
        </a-col>
        <a-col :span="8">
          <a-form-model-item label="发票原件：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="attachment">
            <j-upload v-model="model.attachment" :disabled="disabled" class="upload-input"></j-upload>
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
          :rowSelection="false"
          :toolbar="!disabled"
          :resizable="true"
          :edit-config="{ trigger: 'click', mode: 'row', showIcon: false }"
          @edit-actived="({ row }) => setMaterialUnitOptions(row)"
          @selectRowChange="({ selectedRows }) => (this.materialTable.selectedRowCount = selectedRows.length)"
          @valueChange="onEntryValueChange"
        >
          <!-- <template v-if="!disabled" v-slot:toolbarPrefix>
                  <a-button type="primary" icon="plus" @click="() => $refs.materialDetailTable.addRows({})"
                    >新增</a-button
                  >
                </template> -->
        </j-vxe-table>
      </div>
    </a-form-model>
  </a-spin>
</template>

<script>
import { postAction } from '@/api/manage'
import { JVxeTableModelMixin } from '@/mixins/JVxeTableModelMixin'
import { JVXETypes } from '@/components/jeecg/JVxeTable'
export default {
  name: 'ProjectForm',
  mixins: [JVxeTableModelMixin],
  components: {},

  data() {
    return {
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
        taxPoint: '',
        invoiceDate: '',
      },
      action: '',
      disabled: false,
      confirmLoading: false,
      refKeys: [],
      validatorRules: {
        invoiceNo: [{ required: true, message: '请输入发票编号！', trigger: 'blur' }],
        invoiceDate: [{ required: true, message: '请选择开票日期！', trigger: 'change' }],
        paymentAttachment: [{ required: true, message: '请上传付款证明！', trigger: 'change' }],
        attachment: [{ required: true, message: '请上传发票原件！', trigger: 'change' }],
      },

      url: {
        add: '/project/invoice/add',
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
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
            placeholder: '请输入',
          },
          {
            title: '未税单价(￥)',
            key: 'unitPrice',
            width: '120px',
            align: 'center',
            type: JVXETypes.normal,
          },
          {
            title: '未税小计(￥)',
            key: 'unitPriceCount',
            type: JVXETypes.normal,
            width: '120px',
            align: 'center',
            statistics: ['sum'],
          },
        ],
      },
    }
  },

  computed: {},

  created() {},

  methods: {
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          postAction(this.url.add, this.model)
            .then((res) => {
              if (res.success) {
                this.$message.success('开票成功！')
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
    createInvoice(record) {
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
      }
    },
  },
}
</script>

<style lang="less" scoped>
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
</style>
