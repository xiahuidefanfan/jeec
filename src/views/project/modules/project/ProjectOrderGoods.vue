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

      <a-button v-if="!disableSubmit && action === 'add'" key="submit" @click="handleSubmit" type="primary"
        >提交</a-button
      >
    </template>
    <order-goods v-if="visible" ref="realForm" @ok="submitCallback" :order="currentOrder" />
  </j-modal>
</template>

<script>
import OrderGoods from './OrderGoods.vue'
import { BillModalMixin } from '@/views/erp/common/mixins/BillModalMixin'

export default {
  name: 'ProjectModal',
  mixins: [BillModalMixin],
  components: { OrderGoods },

  data() {
    return {
      type: '',
      currentOrder: {},
    }
  },
  computed: {
    dialogTitle() {
      if (this.type === 'return') {
        return '销售退货'
      }
      return '销售出库'
    },
  },
  methods: {
    handleSubmit() {
      this.$refs.realForm.submit('add')
    },
    handleSave() {
      this.$refs.realForm.submit('edit')
    },
    show(record, type, action) {
      this.type = type
      this.visible = true
      this.currentOrder = record
      this.action = action
      this.$nextTick(() => {
        this.$refs.realForm.add(action)
      })
    },
  },
}
</script>

<style scoped></style>
