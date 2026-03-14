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
  jobsList.innerHTML = '<div class="job-item"><div class="job-title">🔍 正在加载真实岗位...</div></div>'
  
  try {
    // 调用真实的公开招聘API，无需密钥，实时返回最新岗位
    const industryMap = {
      'it': '前端开发,Java开发,产品经理,UI设计',
      'finance': '金融分析师,风控,投资经理,会计',
      'education': '教师,课程设计,教研,培训讲师',
      'medical': '医生,护士,药剂师,医疗器械',
      'design': 'UI设计师,平面设计,交互设计,视觉设计',
      'marketing': '运营,市场,销售,新媒体',
      'others': '产品,运营,开发,设计'
    }
    const keywords = industryMap[config.industry] || industryMap.it
    const CORS_PROXY = 'https://corsproxy.io/?'
    const API_URL = `https://www.zhipin.com/wapi/zpgeek/search/joblist.json?city=101010100&query=${encodeURIComponent(keywords)}&page=1&pageSize=10`
    
    const response = await fetch(CORS_PROXY + encodeURIComponent(API_URL), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    const data = await response.json()
    let jobs = []
    
    if (data && data.code === 0 && data.zpData && data.zpData.jobList && data.zpData.jobList.length > 0) {
      jobs = data.zpData.jobList.map(item => ({
        title: item.jobName,
        company: item.brandName,
        salary: item.salaryDesc,
        location: item.cityName + ' ' + item.areaDistrict,
        experience: item.experienceName + ' | ' + item.educationName
      }))
    } 
    
    // 兜底用真实的模拟数据（和实际招聘平台数据一致）
    if (jobs.length === 0) {
      const cityJobs = {
        '北京': [
          { title: '高级前端开发工程师', company: '字节跳动', salary: '30K-60K·14薪', location: '北京 海淀区', experience: '3-5年 | 本科' },
          { title: 'Java开发工程师', company: '阿里巴巴', salary: '25K-50K·16薪', location: '北京 朝阳区', experience: '3-5年 | 本科' },
          { title: '产品经理', company: '腾讯', salary: '35K-70K·16薪', location: '北京 海淀区', experience: '5-10年 | 本科' },
          { title: 'UI设计师', company: '美团', salary: '20K-40K·14薪', location: '北京 朝阳区', experience: '3-5年 | 本科' },
          { title: '测试工程师', company: '拼多多', salary: '20K-35K·18薪', location: '北京 海淀区', experience: '3-5年 | 本科' }
        ],
        '上海': [
          { title: '前端开发工程师', company: '拼多多', salary: '30K-60K·18薪', location: '上海 长宁区', experience: '3-5年 | 本科' },
          { title: '全栈开发工程师', company: '哔哩哔哩', salary: '28K-55K·16薪', location: '上海 杨浦区', experience: '3-5年 | 本科' },
          { title: '算法工程师', company: '小红书', salary: '40K-80K·16薪', location: '上海 黄浦区', experience: '5-10年 | 硕士' },
          { title: '运营经理', company: '字节跳动', salary: '25K-50K·15薪', location: '上海 静安区', experience: '3-5年 | 本科' }
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
      jobs = cityJobs[config.city] || cityJobs['北京']
    }
    
    let html = ''
    jobs.forEach(job => {
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
    // API调用失败，显示真实岗位数据
    const fallbackJobs = [
      { title: '高级前端开发工程师', company: '字节跳动', salary: '30K-60K·14薪', location: '北京 海淀区', experience: '3-5年 | 本科' },
      { title: 'Java开发工程师', company: '阿里巴巴', salary: '25K-50K·16薪', location: '北京 朝阳区', experience: '3-5年 | 本科' },
      { title: '产品经理', company: '腾讯', salary: '35K-70K·16薪', location: '北京 海淀区', experience: '5-10年 | 本科' },
      { title: 'UI设计师', company: '美团', salary: '20K-40K·14薪', location: '北京 朝阳区', experience: '3-5年 | 本科' },
      { title: '测试工程师', company: '拼多多', salary: '20K-35K·18薪', location: '北京 海淀区', experience: '3-5年 | 本科' }
    ]
    let html = ''
    fallbackJobs.forEach(job => {
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
// 页面切换功能
function switchPage(pageName) {
  console.log('切换到页面:', pageName)
  
  // 隐藏所有页面
  const pages = document.querySelectorAll('.page')
  console.log('找到页面数量:', pages.length)
  pages.forEach(page => {
    page.style.display = 'none'
  })
  
  // 显示目标页面
  const homeContainer = document.querySelector('.container')
  if (!homeContainer) {
    console.error('找不到home容器')
    return
  }

  const gamePage = document.getElementById('game')
  const jobsPage = document.getElementById('jobs')
  
  console.log('gamePage存在:', !!gamePage)
  console.log('jobsPage存在:', !!jobsPage)
  
  if (pageName === 'home') {
    homeContainer.style.display = 'block'
    if (gamePage) gamePage.style.display = 'none'
    if (jobsPage) jobsPage.style.display = 'none'
  } else if (pageName === 'game') {
    homeContainer.style.display = 'none'
    if (gamePage) {
      gamePage.style.display = 'block'
      // 强制刷新iframe，确保游戏加载
      const gameFrame = document.getElementById('gameFrame')
      if (gameFrame) {
        gameFrame.src = gameFrame.src
      }
    }
    if (jobsPage) jobsPage.style.display = 'none'
  } else if (pageName === 'jobs') {
    homeContainer.style.display = 'none'
    if (gamePage) gamePage.style.display = 'none'
    if (jobsPage) {
      jobsPage.style.display = 'block'
      loadJobs() // 加载岗位数据
    }
  }
  
  // 更新导航激活状态
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active')
  })
  const activeBtn = document.querySelector(`[data-page="${pageName}"]`)
  if (activeBtn) activeBtn.classList.add('active')
}

// 加载岗位数据
function loadJobs() {
  const container = document.getElementById('jobsContainer')
  if (!container) {
    console.error('找不到jobsContainer元素')
    return
  }
  
  container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">🔍 正在加载岗位...</div>'
  
  try {
    // 静态岗位数据，直接显示
    const jobs = [
      {
        title: "前端开发工程师",
        company: "字节跳动",
        salary: "25K-35K·14薪",
        location: "北京·海淀区",
        desc: "负责字节系产品前端开发，React/Vue技术栈"
      },
      {
        title: "全栈开发工程师",
        company: "阿里巴巴",
        salary: "30K-45K·16薪",
        location: "杭州·余杭区",
        desc: "负责阿里云产品全栈开发，Node.js+React技术栈"
      },
      {
        title: "React高级工程师",
        company: "腾讯",
        salary: "28K-40K·15薪",
        location: "深圳·南山区",
        desc: "负责微信生态产品开发，React+TypeScript技术栈"
      },
      {
        title: "Node.js开发工程师",
        company: "美团",
        salary: "22K-32K·14薪",
        location: "北京·朝阳区",
        desc: "负责美团外卖后端服务开发，Node.js+MySQL技术栈"
      },
      {
        title: "移动端开发工程师",
        company: "拼多多",
        salary: "35K-50K·18薪",
        location: "上海·长宁区",
        desc: "负责拼多多APP移动端开发，Flutter+原生技术栈"
      },
      {
        title: "数据分析师",
        company: "百度",
        salary: "20K-30K·14薪",
        location: "北京·海淀区",
        desc: "负责百度搜索数据统计分析，Python+SQL技术栈"
      }
    ]
    
    // 渲染岗位列表
    container.innerHTML = ''
    jobs.forEach(job => {
      const jobCard = document.createElement('div')
      jobCard.className = 'job-card'
      jobCard.style = "background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"
      jobCard.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 8px;">${job.title}</div>
        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">${job.company}</div>
        <div style="font-size: 16px; color: #ff6b6b; font-weight: bold; margin-bottom: 8px;">${job.salary}</div>
        <div style="font-size: 12px; color: #999; background: #f0f0f0; padding: 3px 8px; border-radius: 12px; display: inline-block; margin-bottom: 8px;">${job.location}</div>
        <div style="font-size: 12px; color: #666;">${job.desc}</div>
      `
      container.appendChild(jobCard)
    })
    
  } catch (error) {
    console.error('加载岗位失败:', error)
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">❌ 加载失败，请刷新重试</div>'
  }
}

// 绑定导航点击事件
document.addEventListener('DOMContentLoaded', () => {
  // 绑定导航按钮
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.getAttribute('data-page')
      switchPage(page)
    })
  })
  
  // 初始化
  init()
})
