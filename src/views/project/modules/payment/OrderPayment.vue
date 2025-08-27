<template>
  <a-spin :spinning="confirmLoading">
    <!-- 主表单区域 -->
    <div>
      <a-form-model ref="form" :model="model" :rules="validatorRules">
        <a-row>
          <a-col :span="12">
            <a-form-model-item label="收付单编号：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
              {{ model.billNo }}
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="货单编号：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
              {{ model.disOrderNo }}
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="付款方：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
              {{ model.customerId_dictText }}
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="应付金额：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }">
              {{ model.transactionAmount }}
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item
              label="付款日期："
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }"
              prop="transactionDate"
            >
              <j-date
                placeholder="请选择"
                :disabled="disabled"
                v-model="model.transactionDate"
                class="date-input"
              ></j-date>
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item
              label="付款金额："
              :labelCol="{ span: 6 }"
              :wrapperCol="{ span: 17 }"
              prop="settlementAmount"
            >
              <a-input-number
                class="date-input"
                v-model="model.settlementAmount"
                placeholder="请输入"
                :readOnly="disabled"
                :max="maxSettlementAmount"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="12">
            <a-form-model-item label="付款证明：" :labelCol="{ span: 6 }" :wrapperCol="{ span: 17 }" prop="attachment">
              <j-upload
                v-model="model.attachment"
                :beforeUpload="beforeUpload"
                class="upload-input"
                :disabled="disabled"
              ></j-upload>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </div>
  </a-spin>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import { JVxeTableModelMixin } from '@/mixins/JVxeTableModelMixin'
export default {
  name: 'ProjectForm',
  mixins: [JVxeTableModelMixin],
  components: {},

  data() {
    return {
      model: {
        //设置初始值的属性、程序赋值的响应式属性
        attachment: '',
        settlementAmount: '',
        transactionDate: '',
      },
      action: '',
      disabled: false,
      confirmLoading: false,
      refKeys: [],
      validatorRules: {
        settlementAmount: [{ required: true, message: '请输入付款金额！', trigger: 'blur' }],
        transactionDate: [{ required: true, message: '请选择付款日期！' }],
        attachment: [{ required: true, message: '请上传付款证明！' }],
      },
      maxSettlementAmount: 0,
      url: {
        add: '/project/projectWriteOffForm/add',
      },
    }
  },

  computed: {},

  created() {},

  methods: {
    initData(record) {
      console.log("3333333333333333")
      Object.assign(this.model, {
        transactionAmount: record.transactionAmount,
        settlementAmount: 0,
        billNo: record.billNo,
        contractNo: record.contractNo,
        disOrderNo: record.disOrderNo,
        customerId_dictText: record.customerId_dictText,
        supplierId: record.supplierId,
        customerId: record.customerId,
      })
      this.maxSettlementAmount = record.transactionAmount - (record.settlementAmount || 0)
      this.model.settlementAmount = this.maxSettlementAmount
    },
    beforeUpload(file) {
      return new Promise((resolve) => {
          const extension = file.name.slice(file.name.lastIndexOf('.'))
          const fileName = this.model.contractNo + "_" + this.model.billNo + '_付款证明'
          const newName = `${fileName}${extension}`
          const modifiedFile = new File([file], newName, { type: file.type })
          console.log(modifiedFile)
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
  },
}
</script>

<style lang="less" scoped>
// .ant-row {
//   margin-bottom: 10px;
// }
.date-input {
  width: 100%;
}
</style>
