// 全局配置
let config = {
  dailySalary: 300,
  workStartTime: '09:00',
  workEndTime: '18:00',
  breakStartTime: '12:00',
  breakDuration: 60,
  currency: '¥',
  city: '北京',
  industry: 'it'
}

// 攒钱目标配置
let goalConfig = {
  name: '买房',
  amount: 1000000,
  saved: 1000,
  monthlySave: 5000
}

// 全局状态
let state = {
  isRunning: false,
  currentEarnings: 0,
  timer: null,
  lastUpdateTime: null,
  lastDate: null,
  earningsPerSecond: 0,
  milestones: [
    { amount: 10, name: '开工红包', icon: '🧧' },
    { amount: 30, name: '咖啡自由', icon: '☕' },
    { amount: 50, name: '午餐达标', icon: '🍚' },
    { amount: 100, name: '下午茶', icon: '🍰' },
    { amount: 200, name: '下班自由', icon: '🎉' },
    { amount: 500, name: '日入五百', icon: '💪' },
    { amount: 1000, name: '日入千薪', icon: '🏆' }
  ]
}

// 初始化
function init() {
  loadConfig()
  loadGoalConfig()
  calculateEarningsPerSecond()
  updateUI()
  updateGoalUI()
  loadJobs()
  startTimer()
}

// 加载配置
function loadConfig() {
  const saved = localStorage.getItem('salaryConfig')
  if (saved) {
    config = { ...config, ...JSON.parse(saved) }
  }
  
  // 更新设置表单
  document.getElementById('dailySalary').value = config.dailySalary
  document.getElementById('workStartTime').value = config.workStartTime
  document.getElementById('workEndTime').value = config.workEndTime
  document.getElementById('breakStartTime').value = config.breakStartTime
  document.getElementById('breakDuration').value = config.breakDuration
  document.getElementById('currency').value = config.currency
  document.getElementById('city').value = config.city
  document.getElementById('industry').value = config.industry
  document.getElementById('jobsApiKey').value = localStorage.getItem('jobsApiKey') || ''
  
  // 更新显示
  document.getElementById('currencySymbol').textContent = config.currency
  document.getElementById('workTimeValue').textContent = `${config.workStartTime} - ${config.workEndTime}`
  document.getElementById('goalCurrency').textContent = config.currency
  document.getElementById('goalCurrencySaved').textContent = config.currency
  document.getElementById('goalCurrencyMonth').textContent = config.currency
}

// 加载目标配置
function loadGoalConfig() {
  const saved = localStorage.getItem('goalConfig')
  if (saved) {
    goalConfig = { ...goalConfig, ...JSON.parse(saved) }
  }
  
  document.getElementById('goalNameInput').value = goalConfig.name
  document.getElementById('goalAmount').value = goalConfig.amount
  document.getElementById('goalSaved').value = goalConfig.saved
  document.getElementById('goalMonthlySave').value = goalConfig.monthlySave
}

// 保存配置
function saveConfig() {
  localStorage.setItem('salaryConfig', JSON.stringify(config))
}

// 保存目标配置
function saveGoalConfig() {
  localStorage.setItem('goalConfig', JSON.stringify(goalConfig))
}

// 计算每秒收入
function calculateEarningsPerSecond() {
  const [startHour, startMin] = config.workStartTime.split(':').map(Number)
  const [endHour, endMin] = config.workEndTime.split(':').map(Number)
  
  let workSeconds = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  workSeconds -= config.breakDuration || 0
  workSeconds *= 60
  
  if (workSeconds > 0) {
    state.earningsPerSecond = config.dailySalary / workSeconds
  }
}

// 启动计时器
function startTimer() {
  if (state.timer) return
  
  state.isRunning = true
  document.getElementById('toggleBtn').textContent = '⏸ 暂停'
  document.getElementById('toggleBtn').className = 'toggle-btn stop'
  
  state.timer = setInterval(() => {
    updateEarnings()
  }, 1000)
}

// 停止计时器
function stopTimer() {
  if (state.timer) {
    clearInterval(state.timer)
    state.timer = null
  }
  
  state.isRunning = false
  document.getElementById('toggleBtn').textContent = '▶️ 开始赚钱'
  document.getElementById('toggleBtn').className = 'toggle-btn start'
}

// 切换计时器
function toggleTimer() {
  if (state.isRunning) {
    stopTimer()
  } else {
    startTimer()
  }
}

// 更新收入
function updateEarnings() {
  const now = new Date()
  const currentTime = now.getTime()
  const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  
  // 新的一天，重置收入
  if (!state.lastDate || state.lastDate !== today) {
    state.currentEarnings = 0
  }
  
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()
  const currentSec = now.getSeconds()
  const currentMinutes = currentHour * 60 + currentMin
  const startMinutes = config.workStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const endMinutes = config.workEndTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  
  // 午休时间
  const breakStartMinTotal = config.breakStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakEndMinTotal = breakStartMinTotal + config.breakDuration
  
  const inWorkTime = currentMinutes >= startMinutes && currentMinutes < endMinutes
  const inBreakTime = currentMinutes >= breakStartMinTotal && currentMinutes < breakEndMinTotal
  
  // 增加收入
  if (inWorkTime && !inBreakTime && state.isRunning) {
    if (state.lastUpdateTime) {
      const secondsPassed = Math.floor((currentTime - state.lastUpdateTime) / 1000)
      state.currentEarnings += state.earningsPerSecond * secondsPassed
    } else {
      // 计算今天已经工作的时间
      let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec
      if (currentMinutes > breakStartMinTotal) {
        secondsWorked -= config.breakDuration * 60
      }
      if (secondsWorked < 0) secondsWorked = 0
      state.currentEarnings = state.earningsPerSecond * secondsWorked
    }
  }
  
  // 更新UI
  updateUI()
  
  state.lastUpdateTime = currentTime
  state.lastDate = today
}

// 更新UI
function updateUI() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMin = now.getMinutes()
  const currentSec = now.getSeconds()
  const currentMinutes = currentHour * 60 + currentMin
  
  const startMinutes = config.workStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const endMinutes = config.workEndTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakStartMinTotal = config.breakStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakEndMinTotal = breakStartMinTotal + config.breakDuration
  
  // 计算进度
  let progressPercent = 0
  if (currentMinutes >= endMinutes) {
    progressPercent = 100
  } else {
    let totalWorkSeconds = (endMinutes - startMinutes) * 60 - config.breakDuration * 60
    let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec
    if (currentMinutes > breakStartMinTotal) {
      secondsWorked -= config.breakDuration * 60
    }
    if (secondsWorked > 0) {
      progressPercent = Math.min(100, (secondsWorked / totalWorkSeconds) * 100)
    }
  }
  
  // 距下班时间
  let remainingTime = ''
  let expectedEarnings = ''
  if (currentMinutes < endMinutes) {
    let remainingMinutes = endMinutes - currentMinutes
    if (currentMinutes < breakEndMinTotal && currentMinutes >= breakStartMinTotal) {
      remainingMinutes -= (breakEndMinTotal - currentMinutes)
    } else if (currentMinutes < breakStartMinTotal) {
      remainingMinutes -= config.breakDuration
    }
    remainingMinutes = Math.max(0, remainingMinutes)
    
    const hours = Math.floor(remainingMinutes / 60)
    const mins = Math.floor(remainingMinutes % 60)
    remainingTime = `距下班 ${hours}小时${mins}分钟`
    
    // 预计收入
    expectedEarnings = (remainingMinutes / 60 * config.dailySalary / ((endMinutes - startMinutes - config.breakDuration) / 60)).toFixed(0)
  } else {
    remainingTime = '已下班'
  }
  
  // 工作时长
  let workSeconds = 0
  const inWorkTime = currentMinutes >= startMinutes && currentMinutes < endMinutes
  const inBreakTime = currentMinutes >= breakStartMinTotal && currentMinutes < breakEndMinTotal
  
  if (inWorkTime && !inBreakTime) {
    let totalWorkSeconds = (endMinutes - startMinutes) * 60 - config.breakDuration * 60
    let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec
    if (currentMinutes > breakStartMinTotal) {
      secondsWorked -= config.breakDuration * 60
    }
    workSeconds = Math.max(0, secondsWorked)
  }
  
  const workHours = Math.floor(workSeconds / 3600)
  const workMins = Math.floor((workSeconds % 3600) / 60)
  const workSecs = workSeconds % 60
  
  // 下一个里程碑
  let nextMilestone = state.milestones.find(m => m.amount > state.currentEarnings)
  if (!nextMilestone) nextMilestone = { amount: '-', name: '已满级', icon: '🌟' }
  
  // 更新DOM
  document.getElementById('currentEarnings').textContent = state.currentEarnings.toFixed(2)
  document.getElementById('workTime').textContent = `${String(workHours).padStart(2, '0')}:${String(workMins).padStart(2, '0')}:${String(workSecs).padStart(2, '0')}`
  document.getElementById('remainingTime').textContent = remainingTime
  document.getElementById('expectedEarnings').textContent = expectedEarnings ? `预计赚 ${config.currency}${expectedEarnings}` : ''
  document.getElementById('progressBar').style.width = `${progressPercent.toFixed(0)}%`
  document.getElementById('progressText').textContent = `${progressPercent.toFixed(0)}%`
  document.getElementById('milestoneIcon').textContent = nextMilestone.icon
  document.getElementById('milestoneAmount').textContent = `${config.currency}${nextMilestone.amount}`
  document.getElementById('milestoneName').textContent = nextMilestone.name
}

// 更新目标UI
function updateGoalUI() {
  const percent = (goalConfig.saved / goalConfig.amount) * 100
  const remaining = goalConfig.amount - goalConfig.saved
  const monthsNeeded = remaining / goalConfig.monthlySave
  const years = Math.floor(monthsNeeded / 12)
  const months = Math.ceil(monthsNeeded % 12)
  
  let timeText = ''
  if (years > 0) {
    timeText += `${years}年`
  }
  if (months > 0) {
    timeText += `${months}个月`
  }
  if (years === 0 && months < 1) {
    timeText = '恭喜！目标即将达成'
  }
  
  document.getElementById('goalName').textContent = `${goalConfig.name} (${config.currency}${goalConfig.amount.toLocaleString()})`
  document.getElementById('goalPercent').textContent = `${percent.toFixed(2)}%`
  document.getElementById('goalBar').style.width = `${Math.min(100, percent)}%`
  document.getElementById('goalTime').textContent = `还需要 ${timeText}`
}

// 加载工作推荐
async function loadJobs() {
  const jobsList = document.getElementById('jobsList')
  jobsList.innerHTML = '<div class="job-item"><div class="job-title">加载中...</div></div>'
  
  try {
    // 优先用真实API，失败后用模拟数据
    let jobs = []
    
    // 尝试调用真实API（聚合数据招聘接口）
    const apiKey = localStorage.getItem('jobsApiKey')
    if (apiKey) {
      const response = await fetch(`https://apis.juhe.cn/jobs/search?key=${apiKey}&city=${encodeURIComponent(config.city)}&keyword=${encodeURIComponent(config.industry)}`, {
        mode: 'cors'
      })
      const data = await response.json()
      if (data && data.result && data.result.list) {
        jobs = data.result.list.map(item => ({
          title: item.job_name,
          company: item.company_name,
          salary: item.salary
        }))
      }
    }
    
    // API调用失败或没有数据，用模拟数据
    if (jobs.length === 0) {
      jobs = getMockJobs(config.city, config.industry)
    }
    
    let html = ''
    jobs.forEach(job => {
      html += `
        <div class="job-item">
          <div class="job-title">${job.title}</div>
          <div class="job-company">${job.company}</div>
          <div class="job-salary">${job.salary}</div>
        </div>
      `
    })
    
    jobsList.innerHTML = html
  } catch (e) {
    // API调用失败，降级使用模拟数据
    const mockJobs = getMockJobs(config.city, config.industry)
    let html = ''
    mockJobs.forEach(job => {
      html += `
        <div class="job-item">
          <div class="job-title">${job.title}</div>
          <div class="job-company">${job.company}</div>
          <div class="job-salary">${job.salary}</div>
        </div>
      `
    })
    jobsList.innerHTML = html
  }
}

// 模拟招聘数据
function getMockJobs(city, industry) {
  const jobs = {
    it: [
      { title: '高级前端开发工程师', company: '字节跳动', salary: '25K-50K' },
      { title: 'Java开发工程师', company: '阿里巴巴', salary: '20K-40K' },
      { title: '产品经理', company: '腾讯', salary: '30K-60K' },
      { title: 'UI设计师', company: '美团', salary: '15K-30K' },
      { title: '测试工程师', company: '拼多多', salary: '15K-25K' }
    ],
    finance: [
      { title: '金融分析师', company: '招商银行', salary: '15K-30K' },
      { title: '风控专员', company: '蚂蚁集团', salary: '18K-35K' },
      { title: '投资经理', company: '高瓴资本', salary: '30K-80K' },
      { title: '会计', company: '普华永道', salary: '10K-20K' },
      { title: '理财顾问', company: '平安银行', salary: '12K-25K' }
    ],
    education: [
      { title: '高中数学老师', company: '新东方', salary: '10K-20K' },
      { title: '课程设计师', company: '猿辅导', salary: '12K-25K' },
      { title: '教学主管', company: '学而思', salary: '15K-30K' },
      { title: '少儿编程老师', company: '核桃编程', salary: '8K-15K' },
      { title: '教研专员', company: '作业帮', salary: '10K-20K' }
    ],
    medical: [
      { title: '临床医生', company: '协和医院', salary: '15K-40K' },
      { title: '护士', company: '301医院', salary: '8K-15K' },
      { title: '药剂师', company: '同仁堂', salary: '7K-12K' },
      { title: '医疗器械销售', company: '辉瑞', salary: '10K-30K' },
      { title: '医学编辑', company: '丁香园', salary: '10K-20K' }
    ]
  }
  
  return jobs[industry] || jobs.it
}

// 打开设置
function openSettings() {
  document.getElementById('settingsModal').classList.add('show')
}

// 关闭设置
function closeSettings() {
  document.getElementById('settingsModal').classList.remove('show')
}

// 保存设置
function saveSettings() {
  config.dailySalary = parseFloat(document.getElementById('dailySalary').value) || 0
  config.workStartTime = document.getElementById('workStartTime').value
  config.workEndTime = document.getElementById('workEndTime').value
  config.breakStartTime = document.getElementById('breakStartTime').value
  config.breakDuration = parseInt(document.getElementById('breakDuration').value) || 0
  config.currency = document.getElementById('currency').value
  config.city = document.getElementById('city').value
  config.industry = document.getElementById('industry').value
  
  // 保存API Key
  const apiKey = document.getElementById('jobsApiKey').value.trim()
  if (apiKey) {
    localStorage.setItem('jobsApiKey', apiKey)
  }
  
  saveConfig()
  calculateEarningsPerSecond()
  
  // 更新显示
  document.getElementById('currencySymbol').textContent = config.currency
  document.getElementById('workTimeValue').textContent = `${config.workStartTime} - ${config.workEndTime}`
  document.getElementById('goalCurrency').textContent = config.currency
  document.getElementById('goalCurrencySaved').textContent = config.currency
  document.getElementById('goalCurrencyMonth').textContent = config.currency
  
  closeSettings()
  
  // 重新加载工作
  loadJobs()
  
  // 提示
  alert('设置已保存')
}

// 打开目标设置
function openGoalSettings() {
  document.getElementById('goalModal').classList.add('show')
}

// 关闭目标设置
function closeGoalSettings() {
  document.getElementById('goalModal').classList.remove('show')
}

// 保存目标设置
function saveGoalSettings() {
  goalConfig.name = document.getElementById('goalNameInput').value || '买房'
  goalConfig.amount = parseFloat(document.getElementById('goalAmount').value) || 1000000
  goalConfig.saved = parseFloat(document.getElementById('goalSaved').value) || 0
  goalConfig.monthlySave = parseFloat(document.getElementById('goalMonthlySave').value) || 5000
  
  saveGoalConfig()
  updateGoalUI()
  
  closeGoalSettings()
  alert('目标已保存')
}

// 点击模态框外部关闭
window.onclick = function(event) {
  const settingsModal = document.getElementById('settingsModal')
  const goalModal = document.getElementById('goalModal')
  
  if (event.target == settingsModal) {
    closeSettings()
  }
  if (event.target == goalModal) {
    closeGoalSettings()
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', init)
