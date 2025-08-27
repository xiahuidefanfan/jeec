<template>
  <div class="our-quotation-container">
    <h3>我方报价信息</h3>
    <div class="info-item">
      <span class="label">询价方：</span>
      <span class="value">{{ inquiryParty }}</span>
    </div>
    <div class="info-item">
      <span class="label">联系人：</span>
      <span class="value">{{ contactPerson }}</span>
    </div>
    <div class="info-item">
      <span class="label">联系电话：</span>
      <span class="value">{{ contactPhone }}</span>
    </div>
    <div class="info-item">
      <span class="label">联系邮箱：</span>
      <span class="value">{{ contactEmail }}</span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      inquiryParty: this.$route.query.inquiryParty,
      contactPerson: this.$route.query.customerContactPerson,
      contactPhone: this.$route.query.customerContactPhone,
      contactEmail: this.$route.query.customerContactEmail
    }
  }
}
</script>

<style scoped>
.our-quotation-container {
  padding: 20px;
}
.info-item {
  margin-bottom: 15px;
}
.label {
  font-weight: bold;
  margin-right: 10px;
}
.value {
  color: #666;
}
</style>