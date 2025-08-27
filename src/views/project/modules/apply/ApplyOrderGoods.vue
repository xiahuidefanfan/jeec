<template>
  <j-modal
    :title="dialogTitle"
    width="60%"
    :visible="visible"
    :maskClosable="false"
    :keyboard="false"
    draggable
    switchFullscreen
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button @click="handleCancel" :type="action === 'detail' ? 'primary' : ''">{{
        action === 'detail' ? '关闭' : '取消'
      }}</a-button>

      <a-button v-if="!disableSubmit && action === 'add'" @click="showRejectModal" type="danger" style="margin-right: 8px"
        >驳回</a-button
      >

      <a-button v-if="!disableSubmit && action === 'add'" key="submit" @click="handleSubmit" type="primary"
        >同意</a-button
      >
    </template>
    <pur-order-goods v-if="currentOrder.orderType !== 'standard_send'" ref="purForm" @ok="submitCallback" :order="currentOrder"/>
    <sales-order-goods v-if="currentOrder.orderType === 'standard_send'" ref="salesForm" @ok="submitCallback" :order="currentOrder"/>
    
    <!-- 驳回原因选择弹窗 -->
    <a-modal
      title="驳回原因"
      :visible="rejectModalVisible"
      @ok="handleReject"
      @cancel="rejectModalVisible = false"
    >
      <a-form :form="rejectForm">
        <a-form-item label="驳回原因" :labelCol="{ span: 5 }" :wrapperCol="{ span: 16 }">
          <a-select
            v-decorator="[
              'rejectReason',
              { rules: [{ required: true, message: '请选择驳回原因' }] }
            ]"
            placeholder="请选择驳回原因"
          >
            <a-select-option v-for="(reason, index) in rejectReasons" :key="index" :value="reason">
              {{ reason }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="备注" :labelCol="{ span: 5 }" :wrapperCol="{ span: 16 }">
          <a-textarea
            v-decorator="['rejectRemark']"
            :rows="4"
            placeholder="请输入备注信息（选填）"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </j-modal>
</template>

<script>
import PurOrderGoods from '../apply/PurOrderGoods.vue'
import SalesOrderGoods from '../apply/SalesOrderGoods.vue'
import { BillModalMixin } from '@/views/erp/common/mixins/BillModalMixin'
import {getAction, postAction} from "@/api/manage";

export default {
  name: 'ProjectModal',
  mixins: [BillModalMixin],
  components: { PurOrderGoods,SalesOrderGoods },
  data() {
    return {
      type: '',
      currentOrder: {},
      url: {
        disOrderDetail: '/project/distributeOrder/disOrderDetail',
        agree: '/project/warehouseApply/agree',
        reject: '/project/warehouseApply/reject',
      },
      rejectModalVisible: false,
      rejectForm: this.$form.createForm(this),
      rejectReasons: ['质检不过', '数量不符', '规格不符', '材质不符', '其他原因']
    }
  },
  computed: {
    dialogTitle() {
      return '入库审批'
    },
  },
  methods: {
    handleSubmit() {
      postAction(this.url.agree, { sourceNo: this.currentOrder.distributeOrderNo})
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.$emit('ok')
            this.close()
          } else {
            this.$warning({ content: res.message })
          }
        })
        .finally(() => {})
    },
    showRejectModal() {
      this.rejectModalVisible = true
      this.rejectForm.resetFields()
    },
    handleReject() {
      this.rejectForm.validateFields((err, values) => {
        if (!err) {
          const params = {
            sourceNo: this.currentOrder.distributeOrderNo,
            rejectReason: values.rejectReason,
            rejectRemark: values.rejectRemark
          }
          
          postAction(this.url.reject, params)
            .then((res) => {
              if (res.success) {
                this.$message.success(res.message)
                this.rejectModalVisible = false
                this.$emit('ok')
                this.close()
              } else {
                this.$warning({ content: res.message })
              }
            })
            .finally(() => {})
        }
      })
    },
    handleSave() {
      const formRef = this.currentOrder.orderType === 'standard_send' ? 'salesForm' : 'purForm'
      this.$refs[formRef].submit('edit')
    },
    show(sourceNo, type, action) {
      this.type = type
      this.visible = true
      this.action = action
      getAction(this.url.disOrderDetail, { sourceNo: sourceNo })
        .then((res) => {
          if (res.success) {
            this.currentOrder = res.result
            // 根据orderType使用正确的ref
            this.$nextTick(() => {
              const formRef = this.currentOrder.orderType === 'standard_send' ? 'salesForm' : 'purForm'
              this.$refs[formRef].add(action)
            })
          } else {
            this.$warning({ content: res.message })
          }
        })
        .finally(() => {})
    },
  },
}
</script>

<style scoped></style>
