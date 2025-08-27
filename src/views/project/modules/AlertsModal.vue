<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="confirmLoading">
      <a-form-model ref="form" :model="model" :rules="validatorRules">
        <a-form-model-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          prop="alertType"
          label="警报类型"
        >
          <j-dict-select-tag
            type="list"
            v-model="model.alertType"
            dictCode="alert_type"
            placeholder="请选择警报类型"
          />
        </a-form-model-item>
        <a-form-model-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          prop="sourceNo"
          label="来源编号"
        >
          <a-input-search
            v-model="model.sourceNo"
            placeholder="请输入来源编号"
            @search="handleSearch"
            enterButton="查询"
          />
        </a-form-model-item>
        <a-form-model-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          prop="alertContent"
          label="警报内容"
        >
          <a-textarea
            v-model="model.alertContent"
            placeholder="请输入警报内容"
            :autoSize="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-model-item>
        <a-form-model-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          prop="alertTime"
          label="警报时间"
        >
          <a-date-picker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            v-model="model.alertTime"
            style="width: 100%"
          />
        </a-form-model-item>
        <a-form-model-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          prop="status"
          label="状态"
        >
          <j-dict-select-tag
            type="list"
            v-model="model.status"
            dictCode="alert_status"
            placeholder="请选择状态"
          />
        </a-form-model-item>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'AlertsModal',
  data() {
    return {
      title: '操作',
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      confirmLoading: false,
      validatorRules: {
        alertType: [{ required: true, message: '请选择警报类型!' }],
        alertContent: [{ required: true, message: '请输入警报内容!' }],
        status: [{ required: true, message: '请选择状态!' }]
      },
      url: {
        add: '/project/alerts/add',
        edit: '/project/alerts/edit'
      }
    }
  },
  methods: {
    add() {
      this.edit({})
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.visible = true
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.$refs.form.resetFields()
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          httpAction(httpurl, this.model, method)
            .then(res => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
                that.close()
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
            })
        }
      })
    },
    handleCancel() {
      this.close()
    },
    handleSearch() {
      this.$emit('search', this.model.sourceNo)
    }
  }
}
</script>