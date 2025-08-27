<template>
  <j-modal
    :title="'项目管理-' + title"
    :width="600"
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
      <a-button v-if="!disableSubmit && action === 'edit'" key="submit" @click="handleSave" type="primary"
        >保存</a-button
      >
      <a-button v-if="!disableSubmit && action === 'add'" key="submit" @click="handleSubmit" type="primary"
        >提交</a-button
      >
    </template>
    <project-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit" />
  </j-modal>
</template>

<script>
import ProjectForm from './ProjectForm.vue'
import { BillModalMixin } from '@/views/erp/common/mixins/BillModalMixin'

export default {
  name: 'ProjectModal',
  mixins: [BillModalMixin],
  components: { ProjectForm },

  data() {
    return {}
  },
  methods: {
    handleSubmit() {
      this.$refs.realForm.submit('add')
    },
    handleSave() {
      this.$refs.realForm.submit('edit')
    },
  },
}
</script>

<style scoped></style>
