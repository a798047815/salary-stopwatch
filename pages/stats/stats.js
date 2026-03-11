// pages/stats/stats.js
Page({
  data: {
    salaryData: {},
    todayEarnings: '0.00',
    weekEarnings: '0.00',
    monthEarnings: '0.00',
    streakDays: 0,
    today: '',
    achievements: [
      { name: '首次开工', desc: '首次使用', icon: '🎉', unlocked: false },
      { name: '全勤一周', desc: '连续7天', icon: '📅', unlocked: false },
      { name: '月入过万', desc: '单月收入>10000', icon: '💰', unlocked: false },
      { name: '早起鸟儿', desc: '8点前开始', icon: '🐦', unlocked: false },
      { name: '夜猫子', desc: '20点后还在', icon: '🦉', unlocked: false },
      { name: '连续打卡', desc: '连续30天', icon: '🔥', unlocked: false }
    ]
  },

  onShow() {
    this.loadData()
  },

  loadData() {
    const salaryData = wx.getStorageSync('salaryData') || {}
    const history = wx.getStorageSync('earningsHistory') || {}
    
    const now = new Date()
    const todayStr = this.formatDate(now)
    const weekEarnings = this.getWeekEarnings(history)
    const monthEarnings = this.getMonthEarnings(history)
    const streakDays = salaryData.streakDays || 0
    
    // 获取今日收入（从全局变量或历史）
    const todayEarnings = history[todayStr] ? history[todayStr].toFixed(2) : '0.00'
    
    // 检查成就
    const achievements = this.checkAchievements(salaryData, monthEarnings)
    
    this.setData({
      salaryData,
      todayEarnings,
      weekEarnings: weekEarnings.toFixed(2),
      monthEarnings: monthEarnings.toFixed(2),
      streakDays,
      today: todayStr,
      achievements
    })
  },

  formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  },

  getWeekEarnings(history) {
    const now = new Date()
    let total = 0
    for (let i = 0; i < 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = this.formatDate(date)
      if (history[dateStr]) {
        total += history[dateStr]
      }
    }
    return total
  },

  getMonthEarnings(history) {
    const now = new Date()
    let total = 0
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const daysInMonth = new Date(year, month, 0).getDate()
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      if (history[dateStr]) {
        total += history[dateStr]
      }
    }
    return total
  },

  checkAchievements(salaryData, monthEarnings) {
    const achievements = this.data.achievements
    const unlocked = salaryData.achievements || []
    
    return achievements.map(a => ({
      ...a,
      unlocked: unlocked.includes(a.name)
    }))
  }
})