import { getAction } from '@/api/manage'
import { REFRESH_CONFIG, SCROLL_OPTIONS } from '@/constants/orderConfig'
import { 
  validateOrderData, 
  sanitizeOrderData, 
  cacheManager, 
  debounce, 
  handleError, 
  performanceMonitor,
  formatCurrency,
  formatDate,
  calculateStatistics
} from '@/utils/orderUtils'

/**
 * 订单列表通用 Mixin
 * 用于销售单和采购单列表组件的代码复用
 */
export default {
  data() {
    return {
      dataList: [],
      loading: false,
      refreshTimer: null,
      errorMessage: '',
      retryCount: 0,
      lastUpdateTime: null,
      statistics: {
        count: 0,
        totalAmount: 0,
        averageAmount: 0
      },
      scrollOption: { ...SCROLL_OPTIONS },
    }
  },
  
  mounted() {
    this.loadDataWithRetry()
    this.startAutoRefresh()
  },
  
  beforeDestroy() {
    this.clearTimer()
  },
  
  methods: {
    // 带重试机制的数据加载
    async loadDataWithRetry() {
      const cacheKey = this.getCacheKey()
      
      // 尝试从缓存获取数据
      const cachedData = cacheManager.get(cacheKey)
      if (cachedData && this.validateCachedData(cachedData)) {
        this.dataList = cachedData
        this.updateStatistics()
        console.log(`${this.moduleName}使用缓存数据`)
        // 仍然尝试刷新数据，但不阻塞UI
        this.loadDataInBackground()
        return
      }
      
      for (let i = 0; i < REFRESH_CONFIG.MAX_RETRY; i++) {
        try {
          await this.loadData()
          this.errorMessage = ''
          this.retryCount = 0
          return
        } catch (error) {
          this.retryCount = i + 1
          const errorMessage = handleError(error, `${this.moduleName}数据加载`)
          console.error(`${this.moduleName}数据加载失败 (${i + 1}/${REFRESH_CONFIG.MAX_RETRY}):`, error)
          
          if (i === REFRESH_CONFIG.MAX_RETRY - 1) {
            this.errorMessage = errorMessage
            this.useFallbackData()
          } else {
            // 指数退避重试
            await new Promise(resolve => 
              setTimeout(resolve, REFRESH_CONFIG.RETRY_DELAY_BASE * Math.pow(2, i))
            )
          }
        }
      }
    },
    
    // 核心数据加载方法
    async loadData() {
      if (!this.apiUrl) {
        throw new Error('API URL 未定义')
      }
      
      this.loading = true
      const startTime = performance.now()
      
      try {
        const response = await getAction(this.apiUrl)
        
        if (response && response.success) {
          // 兼容两种数据结构
          const rawData = response.result?.records || response.result || []
          
          // 数据验证
          if (!validateOrderData(rawData)) {
            throw new Error('返回的数据格式不正确')
          }
          
          // 数据映射和清洗
          const processedData = this.processData(rawData)
          const sanitizedData = sanitizeOrderData(processedData)
          
          this.dataList = sanitizedData
          this.lastUpdateTime = new Date()
          this.updateStatistics()
          
          // 缓存数据
          const cacheKey = this.getCacheKey()
          cacheManager.set(cacheKey, sanitizedData)
          
          // 性能监控
          const loadTime = performance.now() - startTime
          performanceMonitor.recordLoadTime(this.moduleName, loadTime)
          
          console.log(`${this.moduleName}数据加载成功:`, this.dataList.length, '条记录', `耗时: ${loadTime.toFixed(2)}ms`)
        } else {
          throw new Error(response?.message || '数据获取失败')
        }
      } catch (error) {
        console.error(`${this.moduleName}数据加载异常:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    // 处理数据结构，兼容不同的返回格式
    processData(result) {
      let dataList = result
      
      // 兼容分页数据结构
      if (result && result.records) {
        dataList = result.records
      } else if (Array.isArray(result)) {
        dataList = result
      } else {
        dataList = []
      }
      
      // 数据验证
      if (!this.validateData(dataList)) {
        console.warn(`${this.moduleName}数据格式不正确，使用备用数据`)
        this.useFallbackData()
        return
      }
      
      // 数据映射和清洗
      this.dataList = this.mapData(dataList)
    },
    
    // 数据验证
    validateData(data) {
      if (!Array.isArray(data)) return false
      
      const requiredFields = this.getRequiredFields()
      return data.every(item => 
        requiredFields.some(field => 
          item.hasOwnProperty(field) && item[field] !== null && item[field] !== undefined
        )
      )
    },
    
    // 数据映射 - 子组件需要重写此方法
    mapData(dataList) {
      return dataList.map(item => this.mapSingleItem(item))
    },
    
    // 单个数据项映射 - 子组件需要重写此方法
    mapSingleItem(item) {
      return item
    },
    
    // 获取必需字段 - 子组件需要重写此方法
    getRequiredFields() {
      return ['id']
    },
    
    // 使用备用数据 - 子组件需要重写此方法
    useFallbackData() {
      this.dataList = []
      console.log(`使用备用${this.moduleName}数据`)
    },
    
    // 启动自动刷新
    startAutoRefresh() {
      this.refreshTimer = setInterval(() => {
        this.refreshData()
      }, this.getRefreshInterval())
    },
    
    // 获取刷新间隔 - 子组件可以重写此方法
    getRefreshInterval() {
      return 30000 // 默认30秒
    },
    
    // 刷新数据（防抖处理）
    refreshData() {
      if (!this.loading) {
        this.loadDataWithRetry()
      }
    },
    
    // 清除定时器
    clearTimer() {
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer)
        this.refreshTimer = null
      }
    },
    
    // 手动刷新
    manualRefresh() {
      this.clearTimer()
      this.loadDataWithRetry()
      this.startAutoRefresh()
    },
    
    // 格式化金额
    formatCurrency(amount) {
      if (typeof amount !== 'number') {
        amount = parseFloat(amount) || 0
      }
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'CNY'
      }).format(amount)
    },
    
    // 格式化日期
    formatDate(date) {
      if (!date) return ''
      return new Intl.DateTimeFormat('zh-CN').format(new Date(date))
    }
  },
  
  // 计算属性
  computed: {
    // 是否有数据
    hasData() {
      return this.dataList && this.dataList.length > 0
    },
    
    // 数据总数
    dataCount() {
      return this.dataList ? this.dataList.length : 0
    },
    
    // 是否显示错误信息
    showError() {
      return this.errorMessage && !this.loading && !this.hasData
    }
  }
}