<template>
  <j-modal
    title="开票"
    width="55%"
    :visible="visible"
    :maskClosable="false"
    :keyboard="false"
    draggable
    switchFullscreen
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button @click="handleSubmit" type="primary">提交</a-button>
    </template>
    <order-invoice v-if="visible" ref="realForm" @ok="submitCallback" />
  </j-modal>
</template>

<script>
import OrderInvoice from './OrderInvoice.vue'
import { BillModalMixin } from '@/views/erp/common/mixins/BillModalMixin'

export default {
  name: 'ProjectModal',
  mixins: [BillModalMixin],
  components: { OrderInvoice },

  data() {
    return {
      type: '',
    }
  },
  computed: {},
  methods: {
    handleSubmit() {
      this.$refs.realForm.submit()
    },
    show(record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.createInvoice(record)
      })
    },
  },
}
</script>

<style scoped></style>
