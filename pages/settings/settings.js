// pages/settings/settings.js
Page({
  data: {
    salaryData: {},
    currencies: ['¥', '$', '€', '£', '₩'],
    currencyIndex: 0,
    breakDurations: [0, 30, 45, 60, 90, 120],
    breakDurationIndex: 3
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const salaryData = wx.getStorageSync('salaryData') || {}
    const currencyIndex = this.data.currencies.indexOf(salaryData.currency || '¥')
    const breakDurationIndex = this.data.breakDurations.indexOf(salaryData.breakDuration || 60)
    
    this.setData({
      salaryData,
      currencyIndex: currencyIndex >= 0 ? currencyIndex : 0,
      breakDurationIndex: breakDurationIndex >= 0 ? breakDurationIndex : 3
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`salaryData.${field}`]: parseFloat(value) || 0
    })
  },

  onTimeChange(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`salaryData.${field}`]: e.detail.value
    })
  },

  onCurrencyChange(e) {
    const currency = this.data.currencies[e.detail.value]
    this.setData({
      salaryData.currency: currency,
      currencyIndex: e.detail.value
    })
  },

  onBreakDurationChange(e) {
    const duration = this.data.breakDurations[e.detail.value]
    this.setData({
      salaryData.breakDuration: duration,
      breakDurationIndex: e.detail.value
    })
  },

  onSwitch(e) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`salaryData.${field}`]: e.detail.value
    })
  },

  saveData() {
    wx.setStorageSync('salaryData', this.data.salaryData)
    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    })
  }
})