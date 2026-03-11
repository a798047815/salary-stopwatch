// pages/index/index.js
const app = getApp()

Page({
  data: {
    salaryData: {},
    currentEarnings: '0.00',
    workTime: '00:00:00',
    remainingTime: '',
    expectedEarnings: '',
    progressPercent: 0,
    todayMilestones: [],
    completedMilestones: [],
    nextMilestone: { amount: 30, name: '咖啡自由', icon: '☕' },
    isWorking: false,
    workSeconds: 0,
    earningsPerSecond: 0,
    lastUpdateTime: null
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
    this.startTimer()
  },

  onHide() {
    this.stopTimer()
  },

  loadData() {
    const salaryData = wx.getStorageSync('salaryData') || {}
    this.setData({ salaryData })
    this.calculateEarningsPerSecond()
  },

  calculateEarningsPerSecond() {
    const { salaryData } = this.data
    const [startHour, startMin] = salaryData.workStartTime.split(':').map(Number)
    const [endHour, endMin] = salaryData.workEndTime.split(':').map(Number)
    
    let workSeconds = (endHour * 60 + endMin) - (startHour * 60 + startMin)
    workSeconds -= salaryData.breakDuration || 0
    workSeconds *= 60
    
    if (workSeconds > 0) {
      this.setData({
        earningsPerSecond: (salaryData.dailySalary || 0) / workSeconds
      })
    }
  },

  startTimer() {
    if (app.globalData.timer) return
    
    app.globalData.timer = setInterval(() => {
      this.updateEarnings()
    }, 1000)
    
    this.setData({ isWorking: true })
  },

  stopTimer() {
    if (app.globalData.timer) {
      clearInterval(app.globalData.timer)
      app.globalData.timer = null
    }
    this.setData({ isWorking: false })
  },

  updateEarnings() {
    const { salaryData, earningsPerSecond, lastUpdateTime } = this.data
    const now = new Date()
    const currentTime = now.getTime()
    
    // 检查是否在工作时间
    const [startHour, startMin] = (salaryData.workStartTime || '09:00').split(':').map(Number)
    const [endHour, endMin] = (salaryData.workEndTime || '18:00').split(':').map(Number)
    
    const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
    
    let newEarnings = app.globalData.currentEarnings
    
    // 首次运行或新一天，重置
    if (!this.data.lastDate || this.data.lastDate !== today) {
      app.globalData.currentEarnings = 0
      newEarnings = 0
    }
    
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    const currentSec = now.getSeconds()
    const currentMinutes = currentHour * 60 + currentMin
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    // 检查午休
    const [breakStartHour, breakStartMin] = (salaryData.breakStartTime || '12:00').split(':').map(Number)
    const breakStartMinTotal = breakStartHour * 60 + breakStartMin
    const breakDuration = salaryData.breakDuration || 60
    const breakEndMinTotal = breakStartMinTotal + breakDuration
    
    const inWorkTime = currentMinutes >= startMinutes && currentMinutes < endMinutes
    const inBreakTime = currentMinutes >= breakStartMinTotal && currentMinutes < breakEndMinTotal
    
    if (inWorkTime && !inBreakTime) {
      // 增加收入
      if (lastUpdateTime) {
        const secondsPassed = Math.floor((currentTime - lastUpdateTime) / 1000)
        newEarnings += earningsPerSecond * secondsPassed
      } else {
        // 今天的总工作时间（秒）
        let totalWorkSeconds = (endMinutes - startMinutes) * 60 - breakDuration * 60
        // 当前已工作秒数
        let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec
        if (currentMinutes > breakStartMinTotal) {
          secondsWorked -= breakDuration * 60
        }
        if (secondsWorked < 0) secondsWorked = 0
        newEarnings = earningsPerSecond * secondsWorked
      }
      app.globalData.currentEarnings = newEarnings
      
      // 检查里程碑
      this.checkMilestones(newEarnings)
    }
    
    // 计算进度
    let progressPercent = 0
    if (inWorkTime && !inBreakTime) {
      let totalWorkSeconds = (endMinutes - startMinutes) * 60 - breakDuration * 60
      let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec
      if (currentMinutes > breakStartMinTotal) {
        secondsWorked -= breakDuration * 60
      }
      if (secondsWorked > 0) {
        progressPercent = Math.min(100, (secondsWorked / totalWorkSeconds) * 100)
      }
    } else if (currentMinutes >= endMinutes) {
      progressPercent = 100
    }
    
    // 距下班
    let remainingTime = ''
    let expectedEarnings = ''
    if (currentMinutes < endMinutes) {
      let remainingMinutes = endMinutes - currentMinutes - (currentMinutes > breakStartMinTotal ? breakDuration : 0) - currentSec / 60
      if (remainingMinutes < 0) remainingMinutes = 0
      const hours = Math.floor(remainingMinutes / 60)
      const mins = Math.floor(remainingMinutes % 60)
      remainingTime = `${hours}小时${mins}分钟`
      expectedEarnings = (remainingMinutes / 60 * (salaryData.dailySalary || 0) / ((endMinutes - startMinutes - breakDuration) / 60)).toFixed(0)
    }
    
    // 工作时间
    let workSeconds = 0
    if (inWorkTime && !inBreakTime) {
      let totalWorkSeconds = (endMinutes - startMinutes) * 60 - breakDuration * 60
      let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec
      if (currentMinutes > breakStartMinTotal) {
        secondsWorked -= breakDuration * 60
      }
      workSeconds = Math.max(0, secondsWorked)
    }
    
    const workHours = Math.floor(workSeconds / 3600)
    const workMins = Math.floor((workSeconds % 3600) / 60)
    const workSecs = workSeconds % 60
    
    this.setData({
      currentEarnings: newEarnings.toFixed(2),
      workTime: `${String(workHours).padStart(2, '0')}:${String(workMins).padStart(2, '0')}:${String(workSecs).padStart(2, '0')}`,
      remainingTime,
      expectedEarnings,
      progressPercent: progressPercent.toFixed(0),
      lastUpdateTime: currentTime,
      lastDate: today
    })
  },

  checkMilestones(earnings) {
    const milestones = [
      { amount: 10, name: '开工红包', icon: '🧧' },
      { amount: 30, name: '咖啡自由', icon: '☕' },
      { amount: 50, name: '午餐达标', icon: '🍚' },
      { amount: 100, name: '下午茶', icon: '🍰' },
      { amount: 200, name: '下班自由', icon: '🎉' },
      { amount: 500, name: '日入五百', icon: '💪' },
      { amount: 1000, name: '日入千薪', icon: '🏆' }
    ]
    
    let nextMilestone = milestones.find(m => m.amount > earnings)
    if (!nextMilestone) nextMilestone = { amount: '-', name: '已满级', icon: '🌟' }
    
    this.setData({ nextMilestone })
  },

  toggleTimer() {
    if (this.data.isWorking) {
      this.stopTimer()
    } else {
      this.startTimer()
    }
  }
})