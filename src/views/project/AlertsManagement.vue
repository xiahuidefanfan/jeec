<template>
  <div class="alerts-management">
    <a-card title="提醒管理" :bordered="false">
      <div class="table-operator">
          <a-button @click="refreshList" type="primary" icon="reload">刷新</a-button>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
        </span>
      </a-table>

      <alerts-modal ref="modalForm" @ok="modalFormOk"></alerts-modal>
    </a-card>
  </div>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import AlertsModal from './modules/AlertsModal'
import { getAction, deleteAction } from '@/api/manage'

export default {
  name: 'AlertsManagement',
  mixins: [JeecgListMixin],
  components: {
    AlertsModal
  },
  data() {
    return {
      description: '警报管理页面',
      // 表头
      columns: [
        {
          title: '警报类型',
          align: 'center',
          dataIndex: 'alertType',
          scopedSlots: { customRender: 'alertType' }
        },
        {
          title: '来源编号',
          align: 'center',
          dataIndex: 'sourceNo'
        },
        {
          title: '警报内容',
          align: 'center',
          dataIndex: 'alertContent'
        },
        {
          title: '警报时间',
          align: 'center',
          dataIndex: 'alertTime'
        },
        {
          title: '状态',
          align: 'center',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/project/alerts/list',
      }
    }
  },
  methods: {
    refreshList() {
      this.loadData();
    },
    handleAdd() {
      this.$refs.modalForm.add()
      this.$refs.modalForm.title = '新增警报'
    },
    handleEdit(record) {
      this.$refs.modalForm.edit(record)
      this.$refs.modalForm.title = '编辑警报'
    }
  }
}
</script>

<style scoped>
.alerts-management {
  padding: 24px;
}
</style>