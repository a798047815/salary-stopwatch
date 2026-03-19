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
  ],
  currentPage: 'home'
}

// 页面切换功能 - 修复版
function switchPage(pageName) {
  if (state.currentPage === pageName) return

  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active')
  })

  // 显示目标页面
  const targetPage = document.getElementById(`${pageName}-page`)
  if (targetPage) {
    targetPage.classList.add('active')
  }

  // 更新底部导航状态
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active')
  })
  const navIndex = ['home', 'game', 'jobs'].indexOf(pageName)
  if (navIndex !== -1) {
    document.querySelectorAll('.nav-item')[navIndex].classList.add('active')
  }

  // 页面切换后的回调
  if (pageName === 'jobs') {
    loadFullJobs()
  } else if (pageName === 'game') {
    initGame()
  }

  state.currentPage = pageName
}

// 初始化
function init() {
  loadConfig()
  loadGoalConfig()
  calculateEarningsPerSecond()
  updateGoalUI()
  loadJobs()
  
  // 只有在工作时间内才自动启动计时器
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = config.workStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const endMinutes = config.workEndTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakStartMinTotal = config.breakStartTime.split(':').map(Number).reduce((h, m) => h * 60 + m, 0)
  const breakEndMinTotal = breakStartMinTotal + config.breakDuration
  
  const inWorkTime = currentMinutes >= startMinutes && currentMinutes < endMinutes
  const inBreakTime = currentMinutes >= breakStartMinTotal && currentMinutes < breakEndMinTotal
  
  if (inWorkTime && !inBreakTime) {
    startTimer()
  } else {
    stopTimer() // 非工作时间默认暂停
  }
  
  // 启动计时器后再更新收入，确保已工作时长被正确计算
  updateEarnings() // 立即计算并更新一次收入
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
  }, 100) // 每100毫秒更新一次，让数字跳动更流畅
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
      const secondsPassed = (currentTime - state.lastUpdateTime) / 1000 // 精确到毫秒
      state.currentEarnings += state.earningsPerSecond * secondsPassed
    } else {
      // 计算今天已经工作的时间
      let secondsWorked = (currentMinutes - startMinutes) * 60 + currentSec + currentSec / 1000
      if (currentMinutes > breakStartMinTotal) {
        secondsWorked -= config.breakDuration * 60
      }
      if (secondsWorked < 0) secondsWorked = 0
      state.currentEarnings = state.earningsPerSecond * secondsWorked
    }
  } else if (!inWorkTime && state.isRunning) {
    // 下班后，薪资固定为当日日薪，不再增长
    const workDurationMinutes = (endMinutes - startMinutes) - config.breakDuration
    const dailySalary = state.earningsPerSecond * workDurationMinutes * 60
    state.currentEarnings = dailySalary
    stopTimer() // 自动停止计时器
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
    const workHoursTotal = (endMinutes - startMinutes - config.breakDuration) / 60
    expectedEarnings = ((remainingMinutes / 60) * config.dailySalary / workHoursTotal).toFixed(0)
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

// 加载首页工作推荐
async function loadJobs() {
  const jobsList = document.getElementById('jobsList')
  jobsList.innerHTML = '<div class="job-item"><div class="job-title">🔍 正在加载岗位...</div></div>'
  
  try {
    const jobs = getMockJobs(config.city, config.industry)
    let html = ''
    jobs.slice(0, 3).forEach(job => {
      html += `
        <div class="job-item" style="padding: 15px 0; border-bottom: 1px solid #f0f0f0;">
          <div class="job-title" style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px;">${job.title}</div>
          <div class="job-company" style="font-size: 14px; color: #666; margin-bottom: 5px;">${job.company}</div>
          <div class="job-salary" style="font-size: 16px; color: #ff6b6b; font-weight: bold; margin-bottom: 5px;">${job.salary}</div>
          <div style="font-size: 12px; color: #999; display: flex; gap: 10px;">
            <span>${job.location}</span>
            <span>${job.experience}</span>
          </div>
        </div>
      `
    })
    jobsList.innerHTML = html
  } catch (e) {
    console.error('岗位加载失败:', e)
  }
}

// 加载全量岗位列表
async function loadFullJobs() {
  const jobsList = document.getElementById('fullJobsList')
  jobsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">🔍 正在加载最新岗位...</div>'
  
  try {
    const jobs = getMockJobs(config.city, config.industry)
    let html = ''
    jobs.forEach(job => {
      html += `
        <div class="job-card">
          <div class="job-title">${job.title}</div>
          <div class="job-company">${job.company}</div>
          <div class="job-salary">${job.salary}</div>
          <div class="job-location">${job.location}</div>
          <div class="job-desc">${job.desc || '要求3年以上相关工作经验，熟悉对应技术栈，具备良好的沟通能力和团队协作精神。'}</div>
        </div>
      `
    })
    jobsList.innerHTML = html
  } catch (e) {
    console.error('全量岗位加载失败:', e)
    jobsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">加载失败，请稍后重试</div>'
  }
}

// 模拟招聘数据
function getMockJobs(city, industry) {
  const cityJobs = {
    '北京': [
      { title: '高级前端开发工程师', company: '字节跳动', salary: '30K-60K·14薪', location: '北京 海淀区', experience: '3-5年 | 本科', desc: '负责字节系产品前端开发，React/Vue技术栈，要求3年以上前端开发经验，熟悉移动端适配。' },
      { title: 'Java开发工程师', company: '阿里巴巴', salary: '25K-50K·16薪', location: '北京 朝阳区', experience: '3-5年 | 本科', desc: '负责阿里电商平台后端开发，Java+SpringBoot技术栈，有高并发系统设计经验优先。' },
      { title: '产品经理', company: '腾讯', salary: '35K-70K·16薪', location: '北京 海淀区', experience: '5-10年 | 本科', desc: '负责微信生态产品规划，需要有C端产品经验，良好的用户思维和数据分析能力。' },
      { title: 'UI设计师', company: '美团', salary: '20K-40K·14薪', location: '北京 朝阳区', experience: '3-5年 | 本科', desc: '负责美团外卖产品UI设计，需要有移动端设计经验，熟悉Figma等设计工具。' },
      { title: '测试工程师', company: '拼多多', salary: '20K-35K·18薪', location: '北京 海淀区', experience: '3-5年 | 本科', desc: '负责电商平台功能测试和自动化测试，需要有测试用例设计经验，熟悉Python/Java。' },
      { title: '算法工程师', company: '百度', salary: '40K-80K·16薪', location: '北京 海淀区', experience: '3-5年 | 硕士', desc: '负责AI大模型相关算法开发，需要有机器学习、深度学习相关经验，发表过顶会论文优先。' }
    ],
    '上海': [
      { title: '前端开发工程师', company: '拼多多', salary: '30K-60K·18薪', location: '上海 长宁区', experience: '3-5年 | 本科' },
      { title: '全栈开发工程师', company: '哔哩哔哩', salary: '28K-55K·16薪', location: '上海 杨浦区', experience: '3-5年 | 本科' },
      { title: '算法工程师', company: '小红书', salary: '40K-80K·16薪', location: '上海 黄浦区', experience: '5-10年 | 硕士' },
      { title: '运营经理', company: '字节跳动', salary: '25K-50K·15薪', location: '上海 静安区', experience: '3-5年 | 本科' },
      { title: '产品经理', company: '饿了么', salary: '28K-50K·15薪', location: '上海 普陀区', experience: '3-5年 | 本科' }
    ],
    '广州': [
      { title: '前端开发工程师', company: '微信', salary: '25K-50K·16薪', location: '广州 海珠区', experience: '3-5年 | 本科' },
      { title: '产品经理', company: '唯品会', salary: '20K-40K·14薪', location: '广州 荔湾区', experience: '3-5年 | 本科' },
      { title: 'Java开发工程师', company: '网易游戏', salary: '30K-60K·16薪', location: '广州 天河区', experience: '3-5年 | 本科' }
    ],
    '深圳': [
      { title: '前端开发工程师', company: '腾讯', salary: '30K-65K·16薪', location: '深圳 南山区', experience: '3-5年 | 本科' },
      { title: '硬件工程师', company: '华为', salary: '35K-70K·14薪', location: '深圳 龙岗区', experience: '5-10年 | 本科' },
      { title: '产品经理', company: '大疆', salary: '28K-55K·16薪', location: '深圳 南山区', experience: '3-5年 | 本科' }
    ],
    '杭州': [
      { title: 'Java开发工程师', company: '阿里巴巴', salary: '25K-55K·16薪', location: '杭州 余杭区', experience: '3-5年 | 本科' },
      { title: '前端开发工程师', company: '网易', salary: '22K-45K·16薪', location: '杭州 滨江区', experience: '3-5年 | 本科' },
      { title: '运营专员', company: '抖音电商', salary: '18K-35K·15薪', location: '杭州 余杭区', experience: '1-3年 | 本科' }
    ]
  }
  
  return cityJobs[city] || cityJobs['北京']
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
window.onload = init
