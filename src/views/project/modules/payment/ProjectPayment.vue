<template>
  <j-modal
    :title="dialogTitle"
    width="800px"
    :visible="visible"
    :maskClosable="false"
    :keyboard="false"
    draggable
    switchFullscreen
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
  >
    <template slot="footer">
      <a-button @click="handleCancel">关闭</a-button>
      <a-button v-if="!disableSubmit" key="submit" @click="handleSubmit" type="primary">提交</a-button>
    </template>
    <order-payment v-if="visible" ref="realForm" @ok="submitCallback" :disabled="disableSubmit" />
  </j-modal>
</template>

<script>
import OrderPayment from './OrderPayment.vue'
import { BillModalMixin } from '@/views/erp/common/mixins/BillModalMixin'

export default {
  name: 'ProjectModal',
  mixins: [BillModalMixin],
  components: { OrderPayment },

  data() {
    return {
      type: '',
      currentBill: {},
    }
  },
  computed: {
    dialogTitle() {
      return `新增核销`
    },
  },
  methods: {
    handleSubmit() {
      this.$refs.realForm.submit('add')
    },
    show(record) {
      this.visible = true
      this.currentBill = record
      this.$nextTick(() => {
        this.$refs.realForm.initData(record)
      })
    },
  },
}
</script>

<style scoped></style>
