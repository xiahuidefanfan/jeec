import { getAction, postAction } from '@/api/manage'

export default {
  props: {
    projectNo: String,
  },
  data() {
    return {
      queryParam: {
        projectNo: '',
      },
      action: 'detail',
      confirmLoading: false,
      modelBak: {},
    }
  },
  computed: {
    disabled() {
      return this.action === 'detail'
    },
  },
  methods: {
    resetColumns() {
      this.materialTable.columns = JSON.parse(JSON.stringify(this.materialTable.columns))
    },
    // 新增
    myHandleAdd() {
      this.action = 'add'
      this.model = {
        materialDetailList: [],
      }
      this.resetColumns()
    },
    myHandleDetail(record) {
      this.action = 'detail'
      //TODO:临时
      record.materialDetailList = record.materialDetailList ? record.materialDetailList : []
      this.model = JSON.parse(JSON.stringify(record))
      this.initMaterialList()
      this.resetColumns()
    },
    myHandleEdit(record) {
      this.action = 'edit'
      this.model = JSON.parse(JSON.stringify(record))
      this.modelBak = JSON.parse(JSON.stringify(record))
      this.resetColumns()
    },
    myHandleCancel() {
      if (this.action === 'add') {
        this.model = this.dataSource[0] || {}
      } else {
        this.model = this.modelBak
      }
      this.action = 'detail'
    },
    handleDetailDelete(arr, item) {
      arr.remove(item)
    },
    async submit() {
      const valid = await this.$refs.moduleForm.validate()
      if (!valid) {
        return
      }
      const curstomValidatRes = await this.customValidate()
      if (!curstomValidatRes) {
        return
      }
      this.confirmLoading = true
      const params = this.generateRequestParams()
      if (!params.projectNo) {
        params.projectNo = this.queryParam.projectNo
      }
      postAction(this.url[this.action], params)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            // this.$emit('ok')
            // this.close()
            this.action = 'detail'
            this.loadData()
          } else {
            this.$warning({ content: res.message })
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      var params = this.getQueryParams() //查询条件
      this.loading = true
      getAction(this.url.list, params)
        .then((res) => {
          if (res.success) {
            this.dataInit && this.dataInit(res.result.records)
            //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
            this.dataSource = res.result.records || res.result
            if (res.result.total) {
              this.ipagination.total = res.result.total
              if (this.action === 'add' || res.result.records.length === 0) {
                return
              }
              if (!this.model.id || !res.result.records.find((record) => record.id === this.model.id)) {
                this.myHandleDetail(res.result.records[0])
              }
            } else {
              this.ipagination.total = 0
            }
            //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    emptyColumns(row, columnKeys, jvxeTable) {
      if (!columnKeys || columnKeys.length === 0) return
      jvxeTable = jvxeTable || this.$refs.materialDetailTable

      const values = {}
      const keys = Array.isArray(columnKeys) ? columnKeys : columnKeys.split(',')
      for (let key of keys) values[key] = ''
      jvxeTable.setValues([{ rowKey: row.id, values: values }])
    },
    initMaterialRelated(materialData) {
      if (!materialData) {
        return
      }
      const _col = this.materialTable.columns.find((c) => c.key === 'materialId')
      if (!_col) return
      delete _col.dictCode
      const col = this.materialTable.columns.find((c) => c.key === 'materialId')
      col.options = materialData.map((m) => ({ value: m.id, text: m.auxName }))
      this.initMaterialList()
      this.resetColumns()
    },
    //物料列valueChange时，设置单位列的options，设置物料规格型号, 清空其他关联列值
    handleMaterialChange(row, jVxeTable, emptyColumnKeys) {
      jVxeTable = jVxeTable || this.$refs.materialDetailTable

      let material = null

      const materialData = this.materialData||this.$parent.materialData
      if (!!row.materialId && row.materialId.length > 0 && materialData.length > 0 ){
        material = materialData.find((m) => m.id === row.materialId)
      }
      if (!material) {
        return
      }

      //设置物料默认数据
      const values = material
        ? {
            materialCode: material.code,
            unit: material.unitId_dictText,
            materialBrand: material.brand,
            materialName: material.auxName,
          }
        : {}
      jVxeTable.setValues([{ rowKey: row.id, values: values }])
      //清空其他关联列值
      if (emptyColumnKeys && emptyColumnKeys.length > 0) this.emptyColumns(row, emptyColumnKeys, jVxeTable)
    },

    onEntryValueChange(event) {
      const { type, value, oldValue, row, column, target, isSetValues } = event
      if (value === oldValue || isSetValues) return
      switch (column.property) {
        case 'materialId':
          this.handleMaterialChange(row, target)
          break
        //数量、单价改变时，设置小计
        case 'quantity':
        case 'unitPrice':
          target.setValues([
            {
              rowKey: row.id,
              values: {
                unitPriceCount: Number(row.unitPrice) * Number(row.quantity).toFixed(3),
              },
            },
          ])
          break
      }
    },
    setMaterialUnitOptions(row) {
      if (this.disabled) return

      let material = null
      if (row.materialId && row.materialId.length > 0)
        material = this.model.materialDetailList.find((m) => m.id === row.materialId)

      const col = this.$refs.materialDetailTable.vxeColumns.find((c) => c.key === 'unitId')
      if (!!col && !col.disabled) {
        delete col.dictCode
        col.options =
          material && material.validUnitList ? material.validUnitList.map((u) => ({ value: u.id, text: u.name })) : [] //计量单位的可选项列表
      }
    },
    initMaterialList() {
      if (
        this.model.materialDetailList &&
        this.model.materialDetailList.length > 0 &&
        ((this.materialData&&this.materialData.length>0)||(this.$parent.materialData&& this.$parent.materialData.length > 0))
      ) {
        setTimeout(() => {
          this.model.materialDetailList.forEach((row) => {
            this.handleMaterialChange(row)
          })
        }, 100)
      }
    },
  },
  created() {
    this.queryParam.projectNo = this.projectNo
  },
}
