<template>
  <a-spin :spinning="confirmLoading">
    <!-- 主表单区域 -->
    <div>
      <a-form-model ref="form" :model="model" :rules="validatorRules">
        <a-row>
          <a-col :span="24">
            <a-form-model-item
              label="项目编号："
              v-if="model.projectNo"
              :labelCol="{ span: 4 }"
              :wrapperCol="{ span: 19 }"
              prop="projectName"
            >
              {{ model.projectNo }}
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="项目名称：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="projectName">
              <a-input v-model="model.projectName" placeholder="请输入" :readOnly="disabled" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="甲方：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="customerId">
              <j-search-select-tag
                v-model="model.customerId"
                :async="true"
                dict="bas_customer,aux_name,id"
                :disabled="disabled"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="负责人：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="managerId">
              <j-select-user-by-dep v-model="model.managerId" :multi="false" :disabled="disabled" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注：" :labelCol="{ span: 4 }" :wrapperCol="{ span: 19 }" prop="description">
              <a-textarea v-model="model.description" :readOnly="disabled" :rows="4"></a-textarea>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </div>
  </a-spin>
</template>

<script>
import { postAction } from '@/api/manage'
import { JVxeTableModelMixin } from '@/mixins/JVxeTableModelMixin'
export default {
  name: 'ProjectForm',
  mixins: [JVxeTableModelMixin],
  components: {},

  data() {
    return {
      model: {
        //设置初始值的属性、程序赋值的响应式属性
        projectName: '',
        customerId: '',
        description: '',
        managerId: '',
      },
      action: '',
      disabled: false,
      confirmLoading: false,
      refKeys: [],
      validatorRules: {
        projectName: [{ required: true, message: '请输入项目名称！', trigger: 'blur' }],
        customerId: [{ required: true, message: '请选择甲方！' }],
        managerId: [{ required: true, message: '请选择负责人！' }],
      },

      url: {
        add: '/project/add',
        edit: '/project/edit',
      },
    }
  },

  computed: {},

  created() {},

  methods: {
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
</style>
